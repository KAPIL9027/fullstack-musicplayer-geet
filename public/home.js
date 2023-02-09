const toggleButton = document.querySelector('.toggle-button');
const navLinks = document.querySelector('.nav-links');

toggleButton.addEventListener('click',(e)=>
{
    console.log('working');
    navLinks.classList.toggle('active');
});