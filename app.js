document.addEventListener('DOMContentLoaded', () => {
    // Взимаме всички бутони от навигацията и всички екрани
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Намираме кое ID трябва да се покаже
            const targetId = button.getAttribute('data-target');

            // 2. Премахваме 'active' класа от всички бутони и екрани
            navButtons.forEach(btn => btn.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));

            // 3. Добавяме 'active' клас на кликнатия бутон и съответния екран
            button.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });
});
