// Base section handler with common functionality
const BaseSection = {
    getCommonStyles: function() {
        return {
            backgroundType: 'color',
            backgroundColor: '#ffffff',
            backgroundImage: '',
            backgroundGradient: 'linear-gradient(to right, #ffffff, #ffffff)',
            borderWidth: '0px',
            borderColor: '#000000',
            borderStyle: 'solid',
            borderRadius: '0px',
            paddingTop: '20px',
            paddingBottom: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            marginTop: '0px',
            marginBottom: '0px',
            marginLeft: '0px',
            marginRight: '0px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            textAlign: 'center',
            sectionClass: '',
            sectionId: '',
            customStyles: ''
        };
    },

    createPropertiesContainer: function(container) {
        const specificDetails = document.createElement('details');
        specificDetails.classList.add('mb-2');
        specificDetails.open = true;
        const specificSummary = document.createElement('summary');
        specificSummary.textContent = 'Content Properties';
        specificSummary.classList.add('font-medium', 'cursor-pointer');
        specificDetails.appendChild(specificSummary);
        const specificContainer = document.createElement('div');
        specificContainer.classList.add('p-2');
        specificDetails.appendChild(specificContainer);
        container.appendChild(specificDetails);
        return specificContainer;
    }
};