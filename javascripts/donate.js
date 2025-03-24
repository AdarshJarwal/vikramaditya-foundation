document.addEventListener("DOMContentLoaded", () => {
    // Donation Type Mapping
    const donationTypes = {
        'food': 'Food Supplies',
        'clothes': 'Clothing',
        'stationary': 'Stationary & Books',
        'money': 'Monetary Donation',
        'other': 'Other Items'
    };

    // Donation Type Selection
    window.selectDonationType = (type, event) => {
        const selectedType = donationTypes[type];
        if (!selectedType) return;

        // Update hidden input
        document.getElementById('donationType').value = selectedType;
        
        // Visual feedback
        document.querySelectorAll('.donation-type').forEach(el => {
            el.style.backgroundColor = '#fff';
            el.style.border = '2px solid transparent';
        });

        event.currentTarget.style.backgroundColor = '#f8f9fa';
        event.currentTarget.style.border = '2px solid #27ae60';
        
        // Toggle other description field
        const otherDescField = document.getElementById('otherDescription');
        otherDescField.style.display = type === 'other' ? 'block' : 'none';
        
        if(type === 'other') {
            document.getElementById('otherDesc').required = true;
        } else {
            document.getElementById('otherDesc').required = false;
        }
    };

    // Form Submission
    document.getElementById('donationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate donation type
        const donationType = document.getElementById('donationType').value;
        if (!donationType) {
            showErrorToast('Please select a donation type!');
            return;
        }

        // Validate phone number
        const phone = document.getElementById('phone').value;
        if (!/^\d{10}$/.test(phone)) {
            showErrorToast('Invalid phone number (must be 10 digits)');
            return;
        }

        // Validate other description
        if(donationType === 'Other Items') {
            const otherDesc = document.getElementById('otherDesc').value.trim();
            if(!otherDesc) {
                showErrorToast('Please describe your donation');
                return;
            }
        }

        const submitBtn = document.querySelector('.submit-btn');
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';

            const formData = {
                donation_type: donationType,
                full_name: document.getElementById('fullName').value.trim(),
                phone: phone,
                locality: document.getElementById('locality').value.trim(),
                district: document.getElementById('district').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                email: document.getElementById('email').value.trim() || null,
                message: document.getElementById('message').value.trim() || null
            };

            // Add description if other type
            if(donationType === 'Other Items') {
                formData.description = document.getElementById('otherDesc').value.trim();
            }

            // Handle monetary donations differently
            if(donationType === 'Monetary Donation') {
                // Initialize payment gateway here
                const razorpayOptions = {
                    key: 'YOUR_RAZORPAY_KEY',
                    amount: 10000, // ₹100
                    currency: 'INR',
                    name: 'Vikramaditya Foundation',
                    description: 'Donation',
                    handler: function(response) {
                        // On successful payment
                        submitDonation(formData);
                    },
                    prefill: {
                        name: formData.full_name,
                        contact: formData.phone,
                        email: formData.email
                    }
                };
                
                const rzp = new Razorpay(razorpayOptions);
                rzp.open();
            } else {
                // Submit non-monetary donations directly
                await submitDonation(formData);
            }

        } catch (error) {
            showErrorToast(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Donation';
        }
    });

    async function submitDonation(formData) {
        try {
            const response = await fetch('http://localhost:5000/api/donate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Donation submission failed');
            }

            showSuccessToast();
            document.getElementById('donationForm').reset();
            
            // Reset visual selections
            document.querySelectorAll('.donation-type').forEach(el => {
                el.style.backgroundColor = '#fff';
                el.style.border = '2px solid transparent';
            });
            document.getElementById('otherDescription').style.display = 'none';

        } catch (error) {
            showErrorToast(error.message);
        }
    }

    // Toast Functions
    function showSuccessToast() {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.style.backgroundColor = '#4CAF50';
        toast.querySelector('h3').textContent = 'Success!';
        toast.querySelector('p').textContent = 'Donation submitted successfully!';
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
    window.selectDonationType = selectDonationType;
});