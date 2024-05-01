let currentSlide = 1;
let manual = false;

function changeSlide(num) {
    manual = true;
    displaySlide(currentSlide += num);
}

function setSlide(num) {
    manual = true;
    displaySlide(currentSlide = num);
}

function displaySlide(num) {
    let slides = document.getElementsByClassName("slide");
    if (Boolean(manual)) {
        setTimeout(function() {}, 5000);
        let dots = document.getElementsByClassName("dot");
        if (num > slides.length) {
            currentSlide = 1;
        }
        if (num < 1) {
            currentSlide = slides.length;
        }
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[currentSlide-1].style.display = "block";
        dots[currentSlide-1].className += " active";
        manual = false;
        setTimeout(() => displaySlide(currentSlide), 20000);
    }
    else {
        setTimeout(function() {}, 5000);
        let slides = document.getElementsByClassName("slide");
        for (let i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
        }
        currentSlide++;
        if (currentSlide > slides.length) {
            currentSlide = 1;
        }
        slides[currentSlide-1].style.display = "block";
        setTimeout(() => displaySlide(currentSlide), 20000);
    }
}

displaySlide(currentSlide);