(function () {
    if (window.hasInitialized) return;
    window.hasInitialized = true;

    const visitorId = 'V-123123';
    const query = getQueryParams();
    const eventQueue = [];
    let isProcessing = false;

    const processNextEvent = async () => {
        if (isProcessing) return;
        isProcessing = true;

        const nextEvent = eventQueue.shift();
        if (!nextEvent) {
            isProcessing = false;
            return;
        }

        await sendEvent(nextEvent.data);
        isProcessing = false;
        processNextEvent();
    };

    const sendEvent = async (eventData) => {
        try {
            const response = await fetch('http://localhost:3000/api/track-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) throw new Error(`Network response was not ok (${response.status})`);

            console.log('Event sent successfully:', eventData);
        } catch (error) {
            console.error('Error sending event:', error);
        }
    };

    const enqueueEvent = (eventName, metadata) => {
        eventQueue.push({
            data: {
                eventName,
                visitorId,
                surfaceId: query.tagId,
                metadata: { ...metadata },
            },
        });
        processNextEvent();
    };

    const emitEvent = (eventName, metadata = {}) => enqueueEvent(eventName, metadata);

    const handleFormSubmit = (event) => {
        event.preventDefault();
        const formData = Object.fromEntries(new FormData(event.target).entries());

        emitEvent('form_submit', { name: formData.name, email: formData.email, companySize: formData['company-size'] });
    };

    const setupEventListeners = () => {
        const form = document.querySelector('form');
        if (form) form.addEventListener('submit', handleFormSubmit);

        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () =>
                emitEvent('email_entered', { email: emailInput.value })
            );
        }

        document.querySelectorAll('button').forEach(button =>
            button.addEventListener('click', () => {

                if (button.textContent.trim().toLowerCase() === 'submit') return
                const eventName = 'button_click';

                const metadata = {
                    elementId: button.id || 'button',
                    buttonText: button.textContent.trim(),
                };


                emitEvent(eventName, metadata);
            })
        );
    };


    emitEvent('script_initialization');
    emitEvent('page_view', { page: window.location.pathname });


    window.onload = setupEventListeners;


    function getQueryParams() {
        const params = new URLSearchParams(document.currentScript.src.split('?')[1]);
        return {
            tagId: params.get('id'),
            dataLayerName: params.get('l'),
        };
    }
})();
