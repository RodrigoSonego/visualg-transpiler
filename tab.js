function openLP(evt, lpName) {
    let i, tabcontent, tablinks;


    tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";

        }

    tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active","");
            console.log(tablinks[i].className);
        }

    document.getElementById(lpName).style.display = "block";
    evt.currentTarget.className += " active";
}