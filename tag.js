(function() {
    // Unique Visitor ID Generation (could use cookies/localStorage for persistence)
    const visitorId = localStorage.getItem('visitorId') || generateVisitorId();
    if (!localStorage.getItem('visitorId')) {
        localStorage.setItem('visitorId', visitorId);
    }

    // Emit Event Function
    function emitEvent(eventName, metadata) {
        const data = {
            event: eventName,
            metadata: {
                ...metadata,
                visitorId: visitorId,
                timestamp: new Date().toISOString(),
            },
        };
      
        console.log('data :>> ', data);

       
    }

    // Generate a unique visitor ID
    function generateVisitorId() {
        return 'visitor-' + Math.random().toString(36).substr(2, 9);
    }

    // Track script initialization
    emitEvent('script_initialization', {});

    // Track page view
    emitEvent('page_view', { page: window.location.pathname });

    // Track email entry
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            emitEvent('email_entered', { email: this.value });
        });
    }

    // Track clicks on buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            emitEvent('button_click', { elementId: this.id || 'button' });
        });
    });
})();
