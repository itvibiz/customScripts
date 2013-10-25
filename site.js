/*
    tagDiv - 2013
    Our portfolio:  http://themeforest.net/user/tagDiv/portfolio

    Thanks for using our theme! :)
*/

//@prepros-append style_customizer.js


var td_is_js_phone = false; //true if current view port width < 768


var td_is_slide_moving = false; //disable touch when the touch sliders are moving


var td_is_touch_device = !!('ontouchstart' in window);
var td_is_iPad = navigator.userAgent.match(/iPad/i) != null;
var td_is_iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );


var td_is_phone_screen = false;
//update is phone screen
if ((jQuery(window).width() < 768 || jQuery(window).height() < 768) && td_is_iPad === false) {
    td_is_phone_screen = true
}



//detect ie10
if (jQuery.browser.msie && jQuery.browser.version == 10) {
    jQuery("html").addClass("ie10");
}






/*  ----------------------------------------------------------------------------
    On load
 */
jQuery().ready(function() {



    //resize all the videos if we have them
    td_resize_videos();


    /*  ----------------------------------------------------------------------------
        Menu script
     */

    jQuery('#td-top-menu .sf-menu').supersubs({
        minWidth:    10, // minimum width of sub-menus in em units
        maxWidth:    40, // maximum width of sub-menus in em units
        extraWidth:  1 // extra width can ensure lines don't sometimes turn over
    })

    if (td_is_touch_device) {
        //touch
        jQuery('#td-top-menu .sf-menu').superfish({
	    delay:600,
            speed:200,
            useClick:false
        });
    } else {
        //not touch
        jQuery('#td-top-menu .sf-menu').superfish({
            delay:600,
            speed:200,
            useClick:false
        });
    }



    /*  ----------------------------------------------------------------------------
        Affix menu
     */

    var td_menu_offset = 150;


    switch(tds_snap_menu) {
        case 'always':
            jQuery('.td-menu-background').affix({
                offset: {
                    top: td_menu_offset
                }
            })
            break;
        case 'never':
            // do nothing? :)
            jQuery('.td-menu-wrap').css('position', 'relative'); //css fix
            break;
        default:
            if (td_is_phone_screen && td_is_touch_device) {
                jQuery('.td-menu-background').css('position', 'relative'); //css fix
            } else {
                jQuery('.td-menu-background').affix({
                    offset: {
                        top: td_menu_offset
                    }
                })
            }
    }


    //put focus on search box in blog header
    jQuery('#search-button').click(function(){
        jQuery(this).delay(200).queue(function(){
            document.getElementById("td-header-search").focus();
            jQuery(this).dequeue();
        });
    });


    //retina images
    td_retina();

    //colorbox
    jQuery('.td-featured-img').colorbox({
        maxWidth:"95%",
        maxHeight:"95%",
        fixed:true
    });



    //load the ajax functions
    td_ajax_load();

    td_ajax_search();


    //show the mobile menu only on phone screen
    if (td_is_phone_screen) {
        //alert('mobile menu');
        td_mobile_menu2();
    } else {
        if (td_is_touch_device === false) {
            //run the mobile menu script on desktop!
            td_mobile_menu2();
        }
    }


    if (td_is_iPad === false && td_is_touch_device === true) {
        //load fast click only on touch devices, except ipad
        window.addEventListener('load', function () {
            FastClick.attach(document.body);
        }, false);

    }


    /*  ----------------------------------------------------------------------------
        Scroll to top
     */

    var td_is_scrolling_animation = false;


    jQuery(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(e){
        if (td_is_scrolling_animation === false) {
            return;
        } else {
            td_is_scrolling_animation = false;
            jQuery("html, body").stop();
        }
    });


    if (document.addEventListener){
        document.addEventListener('touchmove', function(e) {
            if (td_is_scrolling_animation === false) {
                return;
            } else {
                td_is_scrolling_animation = false;
                jQuery("html, body").stop();
            }
        }, false);
    }


    jQuery(window).scroll(function(){
        if(td_is_scrolling_animation) {
            return;
        }
        if (jQuery(this).scrollTop() > 400) {
            jQuery('.td-scroll-up').addClass('td-scroll-up-visible');
        } else {
            jQuery('.td-scroll-up').removeClass('td-scroll-up-visible');
        }
    });

    jQuery('.td-scroll-up').click(function(){
        if(td_is_scrolling_animation) {
            return;
        }
        td_is_scrolling_animation = true;

        jQuery('.td-scroll-up').removeClass('td-scroll-up-visible');

        jQuery("html, body").animate({ scrollTop: 0 }, {
                    duration: 1200,
                    easing:'easeInOutQuart',
                    complete: function(){
                            td_is_scrolling_animation = false;
                        }
                    }
            );
        return false;
    });



    td_fake_clicks();


}); //end on load




function td_live_responsive(is_on_ready) {
    var td_window_width = jQuery(window).width();

    if (td_window_width < 768) {
        if (td_is_js_phone === false) {
            //console.log('mobile');

        }
        td_is_js_phone = true;
    } else {
        if (td_is_js_phone === true || is_on_ready === true) {
            //console.log('not mobile');
            //fix for small -> big top menu
            jQuery('#td-top-menu .sf-menu').supersubs({
                minWidth:    15, // minimum width of sub-menus in em units
                maxWidth:    40, // maximum width of sub-menus in em units
                extraWidth:  1 // extra width can ensure lines don't sometimes turn over
            });
        }
        td_is_js_phone = false;

    }
}


//click on a div -> go to a url
function td_fake_clicks() {
    jQuery('.td-fake-click').click(function(){
        window.location = jQuery(this).data("fake-click");
    });
}


/*  ----------------------------------------------------------------------------
    Resize the videos
 */
function td_resize_videos() {
    //youtube in content
    jQuery(document).find('iframe[src*="youtube.com"]').each(function() {
        var td_video = jQuery(this);
        td_video.attr('width', '100%');
        var td_video_width = td_video.width();
        td_video.css('height', td_video_width * 0.6, 'important');
    })


    //vimeo in content
    jQuery(document).find('iframe[src*="vimeo.com"]').each(function() {
        var td_video = jQuery(this);
        td_video.attr('width', '100%');
        var td_video_width = td_video.width();
        td_video.css('height', td_video_width * 0.6, 'important');
    })
}




/*  ----------------------------------------------------------------------------
    Ajax search
 */
var td_aj_search_cur_sel = 0;
var td_aj_search_results = 0;
var td_aj_first_down_up = true;
function td_ajax_search() {




    jQuery('#td-header-search').keydown(function(event) {

        //console.log(event.keyCode);


        if ((event.which && event.which == 39) || (event.keyCode && event.keyCode == 39) || (event.which && event.which == 37) || (event.keyCode && event.keyCode == 37)) {
            //do nothing on left and right arrows
            td_aj_search_input_focus();
            return;
        }

        if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {

            //redirectSearch('q');
            var td_aj_cur_element = jQuery('.td-aj-cur-element');
            if (td_aj_cur_element.length > 0) {
                //alert('ra');
                var td_go_to_url = td_aj_cur_element.find('.entry-title a').attr('href');
                window.location = td_go_to_url;
            } else {
                jQuery(this).parent().parent().submit();
            }

            return false; //redirect for search on enter
        } else {

            if ((event.which && event.which == 40) || (event.keyCode && event.keyCode == 40)) {
                // down
                td_aj_search_move_prompt_down();
                return false; //disable the envent

            } else if((event.which && event.which == 38) || (event.keyCode && event.keyCode == 38)) {
                //up
                td_aj_search_move_prompt_up();
                return false; //disable the envent
            } else {
                //various keys
                //td_live_search_do_request();
                td_aj_search_input_focus();
                jQuery('#td-aj-search').empty();
                //td_ajax_search_do_request();
                setTimeout("td_ajax_search_do_request()",100);
                //console.log(td_last_key);
                //console.log('various keys');
            }
            return true;
        }

    });



}

//moves the select up
function td_aj_search_move_prompt_up() {


    if (td_aj_first_down_up === true) {
        td_aj_first_down_up = false;
        if (td_aj_search_cur_sel === 0) {
            td_aj_search_cur_sel = td_aj_search_results - 1;
        } else {
            td_aj_search_cur_sel--;
        }
    } else {
        if (td_aj_search_cur_sel === 0) {
            td_aj_search_cur_sel = td_aj_search_results;
        } else {
            td_aj_search_cur_sel--;
        }
    }


    jQuery('.td_mod_aj_search').removeClass('td-aj-cur-element');



    if (td_aj_search_cur_sel  > td_aj_search_results -1) {
        //the input is selected
        jQuery('.td-search-form').fadeTo(100, 1);
    } else {
        td_aj_search_input_remove_focus();
        jQuery('.td_mod_aj_search').eq(td_aj_search_cur_sel).addClass('td-aj-cur-element');
    }



}

//moves the select prompt down
function td_aj_search_move_prompt_down() {

    if (td_aj_first_down_up === true) {
        td_aj_first_down_up = false;
    } else {
        if (td_aj_search_cur_sel === td_aj_search_results) {
            td_aj_search_cur_sel = 0;
        } else {
            td_aj_search_cur_sel++;
        }
    }


    jQuery('.td_mod_aj_search').removeClass('td-aj-cur-element');

    if (td_aj_search_cur_sel > td_aj_search_results - 1 ) {
        //the input is selected
        jQuery('.td-search-form').fadeTo(100, 1);
    } else {
        td_aj_search_input_remove_focus();
        jQuery('.td_mod_aj_search').eq(td_aj_search_cur_sel).addClass('td-aj-cur-element');
    }


}


// puts the focus on the input box
function td_aj_search_input_focus() {
    td_aj_search_cur_sel = 0;
    td_aj_first_down_up = true;
    jQuery('.td-search-form').fadeTo(100, 1);
    jQuery('.td_mod_aj_search').removeClass('td-aj-cur-element');
}

//removes the focus from the input box
function td_aj_search_input_remove_focus() {
    if (td_aj_search_results !== 0) {
        jQuery('.td-search-form').css('opacity', 0.5);
    }
}

//makes an ajax request
function td_ajax_search_do_request() {

    if (jQuery('#td-header-search').val() == '') {
        td_aj_search_input_focus();
        return;
    }

    //console.log('ajax called');

    jQuery.ajax({
        type: 'POST',
        url: td_ajax_url,
        data: {
            action: 'td_ajax_search',
            td_string: jQuery('#td-header-search').val()
        },
        success: function(data, textStatus, XMLHttpRequest){
            var current_query = jQuery('#td-header-search').val();





            //the search is empty - drop results
            if (current_query == '') {
                jQuery('#td-aj-search').empty();
                return;
            }

            var td_data_object = jQuery.parseJSON(data); //get the data object
            //drop the result - it's from a old query
            if (td_data_object.td_search_query !== current_query) {
                return;
            }

            //reset the current selection and total posts
            td_aj_search_cur_sel = 0;
            td_aj_search_results = td_data_object.td_total_in_list;
            td_aj_first_down_up = true;


            //update the query
            jQuery('#td-aj-search').html(td_data_object.td_data);


            //alert(td_data_object.td_total_in_list);
            /*
             td_data_object.td_data
             td_data_object.td_total_results
             td_data_object.td_total_in_list
             */



        },
        error: function(MLHttpRequest, textStatus, errorThrown){
            //console.log(errorThrown);
        }
    });
}








function td_mobile_menu2() {
    //alert('mobile menu');
    //******************************************************************
    //MOBILE MENU new

    // helper functions

    var trim = function(str)
    {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
    };

    var hasClass = function(el, cn)
    {
        return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
    };

    var addClass = function(el, cn)
    {
        if (!hasClass(el, cn)) {
            el.className = (el.className === '') ? cn : el.className + ' ' + cn;
        }
    };

    var removeClass = function(el, cn)
    {
        el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
    };

    var hasParent = function(el, id)
    {
        if (el) {
            do {
                if (el.id === id) {
                    return true;
                }
                if (el.nodeType === 9) {
                    break;
                }
            }
            while((el = el.parentNode));
        }
        return false;
    };

    // normalize vendor prefixes

    var doc = document.documentElement;

    var transform_prop = window.Modernizr.prefixed('transform'),
        transition_prop = window.Modernizr.prefixed('transition'),
        transition_end = (function() {
            var props = {
                'WebkitTransition' : 'webkitTransitionEnd',
                'MozTransition'    : 'transitionend',
                'OTransition'      : 'oTransitionEnd otransitionend',
                'msTransition'     : 'MSTransitionEnd',
                'transition'       : 'transitionend'
            };
            return props.hasOwnProperty(transition_prop) ? props[transition_prop] : false;
        })();

    window.App = (function()
    {

        var _init = false;
        var app = { };

        var inner_nav_td = document.getElementById('inner-wrap');
        var nav_open = false;
        var nav_class = 'js-nav';

        //console.log(inner_nav_td);
        app.init = function()
        {
            if (_init) {
                return;
            }
            _init = true;

            var closeNavEnd = function(e)
            {
                if (e && e.target === inner_nav_td) {
                    document.removeEventListener(transition_end, closeNavEnd, false);
                }
                nav_open = false;
            };

            app.closeNav =function()
            {
                if (nav_open) {
                    // close navigation after transition or immediately
                    //console.log(inner_nav_td);

                    jQuery('#inner-wrap').css('minHeight', 'auto');
                    var duration = (transition_end && transition_prop) ? parseFloat(window.getComputedStyle(inner_nav_td, '')[transition_prop + 'Duration']) : 0;
                    if (duration > 0) {
                        document.addEventListener(transition_end, closeNavEnd, false);
                    } else {
                        closeNavEnd(null);
                    }
                }
                removeClass(doc, nav_class);
            };

            app.openNav = function()
            {
                if (nav_open) {
                    return;
                }

                //var td_cur_innerwrap_height = jQuery('#inner-wrap').height();

//                if (td_cur_innerwrap_height != td_cur_mobile_nav_height) {
//
//                }
//                alert(td_cur_mobile_nav_height);
                var td_cur_mobile_nav_height = jQuery('.td-menu-animate').height();
                jQuery('#inner-wrap').css('minHeight', td_cur_mobile_nav_height);
                addClass(doc, nav_class);
                nav_open = true;
            };

            app.toggleNav = function(e)
            {

                if (nav_open && hasClass(doc, nav_class)) {
                    app.closeNav();
                } else {
                    app.openNav();
                }
                if (e) {
                    e.preventDefault();
                }
            };

            // open nav with main "nav" button
            //document.getElementById('nav-open-btn').addEventListener('click', app.toggleNav, false);

            jQuery('#td-top-mobile-toggle a, .td-mobile-close a').click(function(){
                app.toggleNav();
            });




            // close nav with main "close" button
            //document.getElementById('nav-close-btn').addEventListener('click', app.toggleNav, false);



            addClass(doc, 'js-ready');

        };

        return app;

    })();

    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', window.App.init, false);
    }




    //jquery touch swipe
    jQuery("html").swipe( {

        swipeLeft:function(event, distance, duration, fingerCount) {

            if (td_is_slide_moving === true) {
                return;
            }
            window.App.closeNav();
            //console.log(event);

        },
        swipeRight:function(event, distance, duration, fingerCount) {
            if (td_is_slide_moving === true) {
                return;
            }

            window.App.openNav();

        },

        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold:120,
        allowPageScroll:'vertical',
        triggerOnTouchEnd:false,
        fallbackToMouseEvents:false,
        excludedElements:'.noSwipe'
    });




}




/*  ----------------------------------------------------------------------------
    Slider callbacks
 */
function slideStartedMoving(args) {
    td_is_slide_moving = true; //used on touch screens + mobile menu 2
}

function slideContentComplete(args) {
    td_is_slide_moving = false;
    if(!args.slideChanged) return false;
    jQuery(args.currentSlideObject).parent().find('.slide-info-wrap').removeClass('slide-wrap-active');
    jQuery(args.currentSlideObject).children('.slide-info-wrap').addClass('slide-wrap-active');
}

function slideContentLoaded(args) {
    if(!args.slideChanged) return false;
   // console.log('loaded');
    jQuery(args.currentSlideObject).parent().find('.slide-info-wrap').removeClass('slide-wrap-active');
    jQuery(args.currentSlideObject).children('.slide-info-wrap').addClass('slide-wrap-active');
}


/*  ----------------------------------------------------------------------------
    blocks ajax support
 */

function td_ajax_load() {
    /*  ----------------------------------------------------------------------------
     AJAX pagination next prev
     */

    jQuery(".td-ajax-next-page").click(function(event){
        event.preventDefault();

        if(jQuery(this).hasClass('ajax-page-disabled')) {
            return;
        }

        current_block_obj = td_getBlockObjById(jQuery(this).data('td_block_id'));

        current_block_obj.td_current_page++;
        ajax_pagination_request(current_block_obj);
    });

    jQuery(".td_ajax-prev-page").click(function(event){
        event.preventDefault();

        if(jQuery(this).hasClass('ajax-page-disabled')) {
            return;
        }

        current_block_obj = td_getBlockObjById(jQuery(this).data('td_block_id'));

        current_block_obj.td_current_page--;
        ajax_pagination_request(current_block_obj);
    });


    /*  ----------------------------------------------------------------------------
     AJAX pagination load more
     */

    jQuery(".td_ajax_load_more").click(function(event){
        event.preventDefault();
        if(jQuery(this).hasClass('ajax-page-disabled')) {
            return;
        }

        current_block_obj = td_getBlockObjById(jQuery(this).data('td_block_id'));

        current_block_obj.td_current_page++;
        ajax_pagination_request(current_block_obj, true);
    });


    /*  ----------------------------------------------------------------------------
     AJAX pagination infinite load
     */
    jQuery('.td_ajax_infinite').waypoint(function(direction) {
        if (direction === 'down') {
            //console.log('loading');
            current_block_obj = td_getBlockObjById(jQuery(this).data('td_block_id'));

            current_block_obj.td_current_page++;
            ajax_pagination_request(current_block_obj, true, true);
        }

    }, { offset: '110%' });


    /*  ----------------------------------------------------------------------------
     AJAX sub cat filter
     */
    jQuery(".ajax-sub-cat").click(function(event){ //click on an ajax category filter
        event.preventDefault();


        //get the current block id
        var current_block_id = jQuery(this).data('td_block_id');

        //destroy any iossliders to avoid bugs
        jQuery('#' + current_block_id).find('.iosSlider').iosSlider('destroy');;

        //get current block
        current_block_obj = td_getBlockObjById(current_block_id);

        //change cur cat
        current_block_obj.td_cur_cat = jQuery(this).data('cat_id');

        current_block_obj.td_current_page = 1;

        //do request
        ajax_pagination_request(current_block_obj);
    });
}

function td_getBlockIndex(myID) {
    cnt = 0;
    tmpReturn = 0;
    jQuery.each(td_blocks, function(index, td_block) {
        //console.log("pid = " + portfolioItem.id + "  id = " + parseInt(myID));
        //alert(myID);
        if (td_block.id === myID) {
            tmpReturn = cnt;
            return false; //brake jquery each
        } else {
            cnt++;
        }
    });
    return tmpReturn;
}


function td_getBlockObjById(myID) {
    return td_blocks[td_getBlockIndex(myID)];
}





function ajax_pagination_request(current_block_obj, td_append, td_is_live) {

    //append the content in container instead of replacing it
    td_append = (typeof td_append === "undefined") ? false : td_append;

    //is live? default = false
    td_is_live = (typeof td_is_live === "undefined") ? false : td_is_live;


    //console.log(td_append);

    if(td_is_live === false) {
        ajax_pagination_loading_start(current_block_obj);
    }


    jQuery.ajax({
        type: 'POST',
        url: td_ajax_url,
        data: {
            action: 'td_ajax_block',
            td_atts: current_block_obj.atts,
            td_cur_cat:current_block_obj.td_cur_cat,
            td_block_id:current_block_obj.id,
            td_column_number:current_block_obj.td_column_number,
            td_current_page:current_block_obj.td_current_page,
            block_type:current_block_obj.block_type
        },
        success: function(data, textStatus, XMLHttpRequest){
            //jQuery(this).parent().parent().parent().find('.td_block_inner').html("");
            var td_data_object = jQuery.parseJSON(data); //get the data object

            /*
             td_data_object.td_block_id
             td_data_object.td_data
             td_data_object.td_cur_cat
             */

            //subcategories
            jQuery('.sub-cat-' + td_data_object.td_block_id).removeClass('cur-sub-cat');
            jQuery('#sub-cat-' + td_data_object.td_block_id + '-' + td_data_object.td_cur_cat).addClass('cur-sub-cat');

            //load the content
            if (td_append === true) {
                jQuery('#' + td_data_object.td_block_id).append(td_data_object.td_data); //show content
            } else {

                jQuery('#' + td_data_object.td_block_id).html(td_data_object.td_data); //show content
            }



            if (td_data_object.td_hide_prev === true) {
                jQuery('#prev-page-' + td_data_object.td_block_id).addClass('ajax-page-disabled');
            } else {
                jQuery('#prev-page-' + td_data_object.td_block_id).removeClass('ajax-page-disabled');
            }

            if (td_data_object.td_hide_next === true) {
                jQuery('#next-page-' + td_data_object.td_block_id).addClass('ajax-page-disabled');
            } else {
                jQuery('#next-page-' + td_data_object.td_block_id).removeClass('ajax-page-disabled');
            }


            var  current_block_obj = td_getBlockObjById(td_data_object.td_block_id);
            if (current_block_obj.block_type === 'slide') {
                //make the first slide active (to have caption)
                jQuery('#' + td_data_object.td_block_id + ' .slide-wrap-active-first').addClass('slide-wrap-active');
            }



            //loading effects
            ajax_pagination_loading_end(current_block_obj);

        },
        error: function(MLHttpRequest, textStatus, errorThrown){
            //console.log(errorThrown);
        }
    });
}


function ajax_pagination_loading_start(current_block_obj) {
    var el_cur_td_block_inner = jQuery('#' + current_block_obj.id);
    jQuery('.td-loader-gif').remove(); //remove any remaining loaders

    el_cur_td_block_inner.addClass('td_block_inner_overflow');
    el_cur_td_block_inner.parent().append('<img class="td-loader-gif" src="' + td_get_template_directory_uri + '/images/AjaxLoader.gif" alt=""/>');
    el_cur_td_block_inner.fadeTo('500',0.1, 'easeInOutCubic');

    //auto height => fixed height
    var td_tmp_block_height = el_cur_td_block_inner.height();
    el_cur_td_block_inner.css('height', td_tmp_block_height);
}


function ajax_pagination_loading_end(current_block_obj) {

    jQuery(this).delay(100).queue(function(){
        jQuery('.td-loader-gif').remove();

        jQuery('#' + current_block_obj.id).fadeTo(700, 1, function(){
            jQuery('#' + current_block_obj.id).css('height', 'auto');
            jQuery('.td_block_inner_overflow').removeClass('td_block_inner_overflow');
        });

        jQuery(this).dequeue();
    });

    //refresh waypoints for infinit scroll
    jQuery.waypoints('refresh');
}


/*  ----------------------------------------------------------------------------
    Add retina support
 */

function td_retina() {
    if (window.devicePixelRatio > 1) {
        jQuery('.td-retina').each(function(i) {
            var lowres = jQuery(this).attr('src');
            var highres = lowres.replace(".png", "@2x.png");
            highres = highres.replace(".jpg", "@2x.jpg");
            jQuery(this).attr('src', highres);
        });


        //custom logo support
        jQuery('.td-retina-data').each(function(i) {
            jQuery(this).attr('src', jQuery(this).data('retina'));
        });

    }
}
