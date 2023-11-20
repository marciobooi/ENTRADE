function clear() {
    var elem = document.querySelectorAll('.myClass').forEach(function (a) {
            a.remove()
        });
    //clean Markers
    var myMarkers = document.querySelectorAll('.leaflet-marker-icon').forEach(function (b) {
            b.remove()
        });

    var shadow = document.querySelectorAll('.my-own-class').forEach(function (d) {
            d.remove()
        });
    $(".wtinfo").removeClass("wtinfo");
    // clean toggler modal btn          
    $("#toggleMenu").remove();
    $('#clean').remove();
}

var animationState = "false"


function animation() {
    animationState = "true"

    if (REF.geo == undefined || REF.geo == '') {
        errorHandler()
    } else {

        clear()

        $('#playanimation')
            .css('display', 'initial')
        $('#playanimation')
            .css('font-size', '12px')
        $('#stopanimation')
            .css('display', 'initial')

        setTimeout(function () {
            console.log("start")
            REF.year = 1990

            $("#playanimation").html(REF.year);

            renderMap()
            clear()
            console.log("end")
        }, 0);

        setTimeout(function () {
            console.log("start")
            REF.year = 1993
            $("#playanimation").html(REF.year);
            $(".wtinfo").removeClass("wtinfo");
            renderMap()
            $(".wtinfo")
            .removeClass("wtinfo");
            clear()
            console.log("end")
        }, 4000);

        setTimeout(function () {
            console.log("start")
            REF.year = 1996
            $("#playanimation")
                .html("1996");
                $(".wtinfo").removeClass("wtinfo");
            renderMap()
            clear()
            console.log("end")
        }, 8000);

        setTimeout(function () {
            console.log("start")
            REF.year = 1999
            $("#playanimation")
                .html("1999");
            renderMap()
            clear()
            console.log("end")
        }, 12000);

        setTimeout(function () {
            console.log("start")
            REF.year = 2002
            $("#playanimation")
                .html("2002");
            renderMap()
            clear()
            console.log("end")
        }, 16000);

        setTimeout(function () {
            console.log("start")
            REF.year = 2005
            $("#playanimation")
                .html("2005");
            renderMap()
            clear()
            console.log("end")
        }, 20000);

        setTimeout(function () {
            console.log("start")
            REF.year = 2008
            $("#playanimation")
                .html("2008");
            renderMap()
            clear()
            console.log("end")
        }, 24000);

        setTimeout(function () {
            console.log("start")
            REF.year = 2011
            $("#playanimation")
                .html("2011");
            renderMap()
            clear()
            console.log("end")
        }, 28000);

        setTimeout(function () {
            console.log("start")
            REF.year = 2014
            $("#playanimation")
                .html("2014");
            renderMap()
            clear()
            console.log("end")
        }, 32000);

        setTimeout(function () {          
            animationState = "false"
            $(".wtinfo").removeClass("wtinfo");
            clear()
            REF.year = availableTimeInterval().last
            $('#playanimation').css('display', 'none')
            $('#playanimation').css('font-size', 'initial')
            $('#stopanimation').css('display', 'none')
            $("#playanimation").html('<i class="fas fa-play"></i>');
            renderMap()
           
           
        }, 36000);
    }
}

function stopanimation() {
    // cancel = "true"
    var max = setTimeout(function () {
        /* Empty function */
    }, 1);

    for (var i = 1; i <= max; i++) {
        window.clearInterval(i);
        window.clearTimeout(i);
        if (window.mozCancelAnimationFrame) window.mozCancelAnimationFrame(i); // Firefox
    }
    animationState = "false"   
    $(".wtinfo").removeClass("wtinfo");
    clear()
    $('#playanimation').css('display', 'none')
    $('#playanimation').css('font-size', 'initial')
    $('#stopanimation').css('display', 'none')
    REF.year = availableTimeInterval().last
    $("#playanimation").html('<i class="fas fa-play"></i>');
    $(".wtinfo").addClass("wtinfo");
    renderMap()
   

}
