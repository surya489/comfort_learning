(function ($) {
    "use strict";

    // FUnction To Check Home Page
    function isHomePage() {
        return window.location.pathname === "/";
    }

    // Function For Scroll Event
    function scrollToElement(element) {
        if (element.length) {
            $('html, body').animate({
                scrollTop: element.offset().top
            }, 'slow');
        }
    }

    // Function To Get Query Params
    function getQueryParam(param) {
        let params = new URLSearchParams(window.location.search);
        return params.get(param);
    }

    // Handle click event
    $('body').on('click', '.', function (event) {
        if (isHomePage()) {
            event.preventDefault();
            let element = $('#products');
            scrollToElement(element);
        } else {
            window.location.href('/?scrollTo=google-review');
        }
    });

    // Handle window load event
    $(window).on('load', function () {
        if (isHomePage()) {
            let scrollTo = getQueryParam('scrollTo');
            if (scrollTo) {
                let element = $('#' + scrollTo);
                scrollToElement(element);
            }
        }
    });

});