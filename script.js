// كنجيبو زر "Voir les jeux"
const gamesButton = document.getElementById("gamesButton");

// ملي المستخدم يضغط عليه
gamesButton.addEventListener("click", function () {

    // كنمشيو لقسم الألعاب
    document.getElementById("games").scrollIntoView({
        behavior: "smooth"
    });
