document.addEventListener("DOMContentLoaded", () => {
    // Volunteer Type Mapping
    const volunteerTypes = {
        'tree-plantation': 'Tree Plantation',
        'education': 'Education Program',
        'food-distribution': 'Food Distribution',
        'cloth-distribution': 'Cloth Distribution'
    };

    // Volunteer Type Selection
    function selectVolunteerType(type, event) {
        const selectedType = volunteerTypes[type];
        if (!selectedType) return;
    
        // Update hidden input
        document.getElementById('volunteerType').value = selectedType;
        
        // Visual feedback
        document.querySelectorAll('.volunteer-type').forEach(el => {
            el.style.backgroundColor = '#fff';
            el.style.border = '2px solid transparent';
        });
    
        event.currentTarget.style.backgroundColor = '#f8f9fa';
        event.currentTarget.style.border = '2px solid #e74c3c';
    }
    

    // Form Submission
    document.getElementById('volunteerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate volunteer type
        const volunteerType = document.getElementById('volunteerType').value;
        if (!volunteerType) {
            showErrorToast('Please select a volunteer type!');
            return;
        }

        // Validate phone number
        const phone = document.getElementById('phone').value;
        if (!/^\d{10}$/.test(phone)) {
            showErrorToast('Invalid phone number (must be 10 digits)');
            return;
        }

        const submitBtn = document.querySelector('.submit-btn');
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';

            const formData = {
                volunteer_type: volunteerType,
                full_name: document.getElementById('fullName').value.trim(),
                phone: phone,
                locality: document.getElementById('locality').value.trim(),
                district: document.getElementById('district').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                email: document.getElementById('email').value.trim() || null,
                message: document.getElementById('message').value.trim() || null
            };

            const response = await fetch('http://localhost:5000/api/volunteer', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Submission failed');
            }

            showSuccessToast();
            document.getElementById('volunteerForm').reset();
            
        } catch (error) {
            showErrorToast(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Application';
        }
    });

    // Toast Functions
    function showSuccessToast() {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.style.backgroundColor = '#4CAF50';
        toast.querySelector('h3').textContent = 'Success!';
        toast.querySelector('p').textContent = 'Form submitted successfully!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function showErrorToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.style.backgroundColor = '#e74c3c';
        toast.querySelector('h3').textContent = 'Error!';
        toast.querySelector('p').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Expose the function to the global scope
    window.selectVolunteerType = selectVolunteerType;
});
