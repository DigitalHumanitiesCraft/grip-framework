// Reader Demo - Interaction Logic

document.addEventListener('DOMContentLoaded', () => {
    // Annotation handling
    const annotations = document.querySelectorAll('.annotation');
    const annotationPanel = document.getElementById('annotation-panel');
    const annotationText = document.getElementById('annotation-text');

    annotations.forEach(annotation => {
        annotation.addEventListener('click', () => {
            const note = annotation.dataset.note;
            annotationText.textContent = note;
            annotationPanel.style.borderLeft = '3px solid var(--color-reader)';
        });

        annotation.addEventListener('mouseenter', () => {
            annotation.style.cursor = 'help';
        });
    });

    // Letter navigation
    const letterBtns = document.querySelectorAll('.letter-btn');
    const prevBtn = document.querySelector('.prev-letter');
    const nextBtn = document.querySelector('.next-letter');
    const letterCounter = document.querySelector('.letter-counter');
    let currentLetter = 1;
    const totalLetters = 12;

    function updateLetterNav() {
        letterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.letter) === currentLetter) {
                btn.classList.add('active');
            }
        });

        prevBtn.disabled = currentLetter === 1;
        nextBtn.disabled = currentLetter === totalLetters;
        letterCounter.textContent = `Brief ${currentLetter} von ${totalLetters}`;
    }

    letterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLetter = parseInt(btn.dataset.letter);
            updateLetterNav();
            // In a real app, this would load the letter content
        });
    });

    prevBtn.addEventListener('click', () => {
        if (currentLetter > 1) {
            currentLetter--;
            updateLetterNav();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentLetter < totalLetters) {
            currentLetter++;
            updateLetterNav();
        }
    });

    // Timeline dots
    const timelineDots = document.querySelectorAll('.timeline-dots .dot');
    timelineDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            timelineDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            // Map dot to letter range
            const letterIndex = Math.min(index * 2 + 1, 6);
            currentLetter = letterIndex;
            updateLetterNav();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentLetter > 1) {
            currentLetter--;
            updateLetterNav();
        } else if (e.key === 'ArrowRight' && currentLetter < totalLetters) {
            currentLetter++;
            updateLetterNav();
        }
    });
});
