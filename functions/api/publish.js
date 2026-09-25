// functions/api/publish.js
// Publishes a generated resume site to a GitHub branch on the dedicated
// "resumepro-builds" repo. That repo has its own connected Cloudflare Pages
// project with preview deployments enabled for all branches, so pushing to
// (or updating) a "resume-<id>" branch automatically builds and deploys it
// to https://resume-<id>.resumepro-builds.pages.dev — no separate hosting
// API call needed beyond the GitHub API itself.
//
// Requires one secret on THIS Pages project (the one running functions/api/):
//   GITHUB_TOKEN — a fine-grained personal access token scoped to ONLY the
//   resumepro-builds repo, with Contents: Read and write permission.
//
// Re-publishing: the frontend sends the previously-returned resume_id back
// in the X-Resume-Id header, so the SAME branch gets force-updated with a
// new commit instead of a new branch (and therefore a new URL) being
// created every time.

// TODO: replace with your actual GitHub username or org.
const OWNER = 'apdg21';
const REPO = 'resumepro-builds';
const BASE_BRANCH = 'main';

export async function onRequestPost({ request, env }) {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ error: 'Server is missing GITHUB_TOKEN.' }, { status: 500 });
  }

  const incomingId = request.headers.get('X-Resume-Id');
  const resumeId = incomingId || crypto.randomUUID().slice(0, 8);
  const branchName = `resume-${resumeId}`;

  const gh = (path, opts = {}) =>
    fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        ...opts.headers,
      },
    });

  try {
    // files: { "index.html": { content, encoding }, "data.json": { content, encoding }, ... }
    const files = await request.json();
    if (!files || Object.keys(files).length === 0) {
      return Response.json({ error: 'No files received.' }, { status: 400 });
    }

    // 1. Get the base branch's latest commit + tree, to branch/build from
    const baseRefRes = await gh(`/git/ref/heads/${BASE_BRANCH}`);
    if (!baseRefRes.ok) {
      return Response.json(
        { error: `Could not read base branch "${BASE_BRANCH}": ${await baseRefRes.text()}` },
        { status: 502 }
      );
    }
    const baseRef = await baseRefRes.json();
    const baseCommit = await (await gh(`/git/commits/${baseRef.object.sha}`)).json();

    // 2. Create a blob for each file
    const treeItems = [];
    for (const [filePath, file] of Object.entries(files)) {
      const blobRes = await gh(`/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({
          content: file.content,
          encoding: file.encoding === 'base64' ? 'base64' : 'utf-8',
        }),
      });
      if (!blobRes.ok) {
        return Response.json({ error: `Failed to upload ${filePath}: ${await blobRes.text()}` }, { status: 502 });
      }
      const blob = await blobRes.json();
      treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha });
    }

    // 3. Create a new tree based on the base tree (so nothing outside these
    //    files gets touched, but anything already on main that ISN'T
    //    overwritten here would still be inherited — keep main minimal)
    const treeRes = await gh(`/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: treeItems }),
    });
    const tree = await treeRes.json();

    // 4. Create a commit
    const commitRes = await gh(`/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: `Publish ${branchName}`,
        tree: tree.sha,
        parents: [baseCommit.sha],
      }),
    });
    const commit = await commitRes.json();

    // 5. Create the branch (first publish) or force-update it (re-publish)
    const refCheck = await gh(`/git/ref/heads/${branchName}`);
    if (refCheck.status === 404) {
      const createRefRes = await gh(`/git/refs`, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: commit.sha }),
      });
      if (!createRefRes.ok) {
        return Response.json({ error: `Failed to create branch: ${await createRefRes.text()}` }, { status: 502 });
      }
    } else {
      const updateRefRes = await gh(`/git/refs/heads/${branchName}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: true }),
      });
      if (!updateRefRes.ok) {
        return Response.json({ error: `Failed to update branch: ${await updateRefRes.text()}` }, { status: 502 });
      }
    }

    return Response.json({
      url: `https://${branchName}.${REPO}.pages.dev`,
      resume_id: resumeId,
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
