var sign_up = '/translator/sign_up/';
var log_in = '/translator/log_in';
var log_out = '/translator/log_out';
var reset_password = '/translator/reset_password';
var upload_file = '/translator/upload_file';

var source_language = "English";
var target_language = "Thai";

var trans_sentences = "/translator/trans_sentences";
var query_dict = '/translator/query_dict';
var detect_similar_words = "/translator/detect_similar_words";
var text_similar_words = "/translator/text_similar_words";

var add_words_url = "/translator/add_words"
var vocabulary_list = "/translator/vocabulary_list";
var query_user_dictionary = "/translator/query_user_dictionary";

var update_sentence = "/translator/update_sentence";
var delete_sentence = "/translator/delete_sentence";
var update_vocabulary = "/translator/update_vocabulary";
var approve_vocabulary = "/translator/approve_vocabulary";
var delete_vocabulary = "/translator/delete_vocabulary";

var s_text = "";
var wait, wait1;
var _ajax_communication;

function ShowSentence()
{
    var selectedText = $('#ta_source').val().trim();
    if (s_text == selectedText) return;
    s_text = selectedText;
    $.ajax({
        // type: "POST",
        url: trans_sentences,
        data: {
          'seltext': selectedText,
          'sl' : source_language.toLowerCase().substr(0,2),
          'tl' : target_language.toLowerCase().substr(0,2)
        },
        dataType: 'json',
        success: function (data) {  //console.log(data);
            $("#ta_target").val(data.content);
        },
        error: function() {
            $("#ta_target").val("Translate error!");
        },
        timeout: 2000
    });
}
function swap_language(){
    var s = source_language;
    source_language = target_language;
    target_language = s;
    $("#btn_source strong").html(source_language);
    $("#btn_target strong").html(target_language);
    $("#ta_source").val($("#ta_target").val());
    $("#ta_target").val("");
    source_textarea_change();
    ShowSentence();
}
function source_textarea_change() {
    var selectedText = $('.source_textarea').val();
    if (selectedText.length > 5000){
            $('.source_textarea').val($('.source_textarea').val().substr(0, 5000));
    } 
    $('.source_textarea').css('height', 'auto');
    // if( $('.source_textarea').val() ) 
    //     $('.textarea_placeholder_text').css("display", "none");
    // else
    //     $('.textarea_placeholder_text').css("display", "block");
    var len = $('.source_textarea').val().length.toString();
    document.getElementById("docTrans_char_count").innerHTML = len + "/5000";
    var height = document.getElementById('ta_source').scrollHeight;
    var fontSize = 23;
    if ($("body").width() < 768) {
        fontSize = 20;
        if ($("body").width() < 400) fontSize = 17;
    } 
    $('.source_textarea').css("font-size", fontSize - (height/500).toFixed(0));
    $('.target_textarea').css("font-size", fontSize - (height/500).toFixed(0));
    height = document.getElementById('ta_source').scrollHeight;
    $('.source_textarea').css('height', height);
    $('.target_textarea').css('height', height);
    $('.textarea_separator').css('height', height+150);
}
function similar_words() {
	var selectedText = $('.source_textarea').val().trim();
    if (s_text == selectedText) return;    
    if(selectedText == "" || selectedText.split(" ").length > 1 
        || selectedText.split("\n").length > 1 || selectedText.split(",").length > 1) {
        document.getElementById('wordDict_help_popup').style.display = "none";
        return;
    }
    if (_ajax_communication) return; 
    _ajax_communication = true;
    $.ajax({
        // type: "POST",
        url: detect_similar_words,
        data: {
        'seltext': selectedText,
        'sl' : source_language.toLowerCase().substr(0,2)
        },
        dataType: 'json',
        success: function (data) {  //console.log(data);
            if(data.content) {
                document.getElementById('wordDict_help_popup').innerHTML = data.content; 
                document.getElementById('wordDict_help_popup').style.display = "block";
                _ajax_communication = false;
            } else {
                document.getElementById('wordDict_help_popup').style.display = "none"; //console.log("empty");
                _ajax_communication = false;
            }
        },
        error: function() {
            document.getElementById('wordDict_help_popup').style.display = "none"; //console.log("error");
            _ajax_communication = false;
        },
        timeout: 1000,
    }).always(function(e){
        // console.log(_ajax_communication);
        _ajax_communication = false;
    });
}
// arrow keycode event function
var _suggest_wordposition = -1;
function suggest_navigation_keys_check(e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    var nodes = document.getElementById('wordDict_help_popup');
    //console.log(e.currentTarget.value);
    if(document.getElementById('wordDict_help_popup').style.display != "none"){
      switch(keycode) {
        case 40: //down arrow
            if(_suggest_wordposition > -1) nodes.childNodes[_suggest_wordposition].style.background = "";
            _suggest_wordposition++;
            if(_suggest_wordposition == nodes.childElementCount) _suggest_wordposition = 0;
            nodes.childNodes[_suggest_wordposition].style.background = "#ddd";
            break;
        case 37: //left arrow
        break;
        case 39: //right arrow
        break;
        case 38: //up arrow
            if(_suggest_wordposition > -1) nodes.childNodes[_suggest_wordposition].style.background = "";
            _suggest_wordposition--;
            if(_suggest_wordposition < 0) _suggest_wordposition = nodes.childElementCount - 1;
            nodes.childNodes[_suggest_wordposition].style.background = "#ddd";
            break;
        case 13://enter
            if(_suggest_wordposition > -1 && _suggest_wordposition < nodes.childElementCount) {
                e.currentTarget.value = nodes.childNodes[_suggest_wordposition].children[0].textContent;
            }
        case 27://esc
            document.getElementById('wordDict_help_popup').style.display = "none";
        default :
            _suggest_wordposition = -1;
      }
    }
}
$(function(){
    $('a[href*="#"]').on('click', function(e) {
        e.preventDefault()    	
        oldObjChild=$('.active > a'); //gets active nav-item child nav-link
        oldObj = $('.active'); //gets the active nav-item
        oldObj.removeClass('active'); //remove active from old nav-item
        oldObjChild.css('background-color','transparent'); //clear old active nav-item and nav-link style for bg color
        oldObjChild.css('color','grey'); //clear old active nav-item and nav-link style for bg color
        $(this).parent().addClass('active'); //set the active class on the nav-item that called the function
        $(this).css('background-color','transparent'); //set active clas background to red
        $(this).css('color','black');
    });
    $("#menu_any").click(function(){
        $(".PopupMenu").remove();
        var t = document.querySelector('#dlMainPopup');
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
    });
    $(document).on('click',".menu_close", function(e) { 
        e.preventDefault();
        $(".PopupMenu").remove();
    });
    $(document).on('click',".menu_overlay", function() { 
        $(".PopupMenu").remove();
    });
    $("#menu_login").click(function(){
        $(".PopupMenu").remove();
        var t = document.querySelector('#login_MainSection');
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
        setTimeout(function(){ document.getElementById("login_email").focus();} , 0);
    });
    $(document).on('click',".menu__login", function() { 
        $("#menu_login").click();
    });
    $(document).on('click',".menu_signup_link", function(){
        $(".PopupMenu").remove();
        var t = document.querySelector('#sign_MainSection');
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
        setTimeout(function(){ document.getElementById("sign_username").focus();} , 0);
    });
    $(document).on('click',".menu__login__form__pass__forgot", function(){
        $(".PopupMenu").remove();
        var t = document.querySelector('#ForgotPasswordSection');
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
        setTimeout(function(){ document.getElementById("reset_email").focus();} , 0);
    });
    $(document).on('click',".menu__sign__form__submit", function(){
        var email = $("#sign_email").val();
        var uname = $("#sign_username").val();
        var firstname = $("#firstname").val();
        var lastname = $("#lastname").val();
        var pwd = $("#sign_password").val();
        var sign_confirm = $("#sign_confirm").val();
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            type: "POST",
            url: sign_up,
            headers:{
                "X-CSRFToken": csrftoken
            },
            data: {
                'email': email,
                'username': uname,
                'first_name': firstname,
                'last_name': lastname,
                'password1': pwd,
                'password2': sign_confirm,
            },
            dataType: 'json',
            cache: true,
            success: function (data, status) {
				var err = data.content;
				err = err.replace(/password1/g, "Password");
				err = err.replace(/password2/g, "Password confirm")
				document.getElementById('menu__error').innerHTML = err;
				document.getElementById('menu__error').style.display = "block";
            },
            error: function() {
                document.getElementById('menu__error').innerHTML = "Sign-up error!";
				document.getElementById('menu__error').style.display = "block";
            },
            timeout: 3000
        });
    });
    $(document).on('click',".menu__login__form__submit", function(){
        var email = $("#login_email").val();
        var pwd = $("#login_password").val();
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            url: log_in,
            headers:{
                "X-CSRFToken": csrftoken
            },
            data: {
                '_email': email,
                '_pwd': pwd,                
            },
            cache: true,
            dataType: 'json',
            success: function (data, status) {
                if (data.content == "ok") {
					$(".PopupMenu").remove();
                    //window.location.reload();
                    window.location = window.location;
                } else {
					var err = data.content;
					err = err.replace(/password1/g, "Password");
					err = err.replace(/password2/g, "Password confirm")
					document.getElementById('menu__error').innerHTML = err;
					document.getElementById('menu__error').style.display = "block";
                }
            },
            error: function() {
                document.getElementById('menu__error').innerHTML = "Login Error!";
                document.getElementById('menu__error').style.display = "block";
            },
            timeout: 3000
        });
    });
    $(document).on('click',"#menu_logout", function(){
        $.ajax({
            url: log_out,
            success: function (data, status) {
				window.location.href ='/translator';
			}
		});
	});
	$(document).on('click',".menu__reset__form__submit", function(){
        var email = $("#reset_email").val();
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            url: reset_password,
            headers:{
                "X-CSRFToken": csrftoken
            },
            data: {
                '_email': email,
            },
            cache: true,
            dataType: 'json',
            success: function (data, status) {
                if (data.content == "ok") {
					document.getElementById('menu__error').innerHTML = data.content;
					document.getElementById('menu__error').style.display = "block";
                }
            },
            error: function() {
                document.getElementById('menu__error').innerHTML = "Password reset error!";
                document.getElementById('menu__error').style.display = "block";
            },
            timeout: 3000
        });
    });
});