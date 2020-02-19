var source_language = "English";
var target_language = "Thai";
var trans_sentences = "trans_sentences";
var query_dict = 'query_dict'
var sign_up = 'sign_up/';
var detect_similar_words = "detect_similar_words"
var log_in = 'log_in';
var log_out = 'log_out';
var reset_password = 'reset_password';
var s_text = "";
var wait, wait1;
var _ajax_communication;

$('.nav li').on('click', function(){
    alert('.nav li')
    $('.nav li').removeClass('active');
    $(this).addClass('active');
});

function ShowSelection()
{
    var ta_source = document.getElementById('ta_source');
    var selectedText;
    if (ta_source.selectionStart !== undefined)
    {// Standards Compliant Version
        var startPos = ta_source.selectionStart;
        var endPos = ta_source.selectionEnd;
        selectedText = ta_source.value.substring(startPos, endPos);
    }
    else if (document.selection !== undefined)
    {// IE Version
        ta_source.focus();
        var sel = document.selection.createRange();
        selectedText = sel.text;
    }
    selectedText = selectedText.trim();
    var sel = selectedText.split(' ');
    if (sel.length > 1) {$(".dict_area").css('display', 'none');return;}
    sel = sel[0].split(',');
    if (sel.length > 1 || selectedText.length == 0) {$(".dict_area").css('display', 'none');return;}
    selectedText = sel[0];
    $.ajax({
        // type: "POST",
        url: query_dict,
        data: {
          'seltext': selectedText,
          'sl' : source_language.toLowerCase().substr(0,2),
          'tl' : target_language.toLowerCase().substr(0,2)
        },
        dataType: 'json',
        success: function (data) {
            if (data.content != "") {
                $(".dict_area").css('display', 'block');
                var dText = data.content;
                dText = dText.replace(/\n/g, "<br>");
                dText = dText.replace(/  /g, "&nbsp;"); //console.log(dText);
                document.getElementById('translator_dict').innerHTML = dText;
            } else {
                $(".dict_area").css('display', 'none');
            }
        },
        error: function() {
            $(".dict_area").css('display', 'none');
        },
        timeout: 2000
    });
}

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
    $('.clear_text_source').click( function (e) {
        $('.source_textarea').val("");
        $('.target_textarea').val("");
        $('.source_textarea').css('height', 'auto');
        source_textarea_change();
        // $('.textarea_placeholder_text').css("display", "block");
    });
    $('.source_textarea').on('keydown keyup paste mouseup change input', function (e) {
		setTimeout(source_textarea_change, 100);
    });
    $('.source_textarea').on('select', function(e) {
        ShowSelection();
    });
    $('.source_textarea').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if(keycode==13) document.getElementById('wordDict_help_popup').style.display = "none";
        clearTimeout(wait);
        wait = setTimeout(ShowSentence, 500);
        clearTimeout(wait1);
        wait1 = setTimeout(similar_words, 200);
    });
    $('.docTrans_translator_upload_button__inner_button').on('click', function (e) {
        $('#docTrans').click();
    });
    $('#docTrans').change(function(e) {
        var _filename = this.files[0].name; 
        var _filetype = _filename.substr(_filename.length - 5, 5).toLowerCase;
        if(_filetype == ".docx") {
            
        } else if (_filetype == ".pptx") {
            
        }
    })
    $("#source_menu li a").on("click", function(event){
        if (source_language != event.currentTarget.text) {
            swap_language();
        }
    });
    $("#target_menu li a").on("click", function(event){
        if (target_language != event.currentTarget.text) {
            swap_language();
        }
    });
    $(".translate_convert").on("click", swap_language);
    $(".target_toolbar__copy").on('click', function(e){
        var $temp = $("<textarea>");
        $("body").append($temp);
        $temp.val($("#ta_target").val()).select();
        document.execCommand("copy");
        $temp.remove();
    });
    $(".target_toolbar__save").click(function(e){
        $("<a />", {
            download: $.now() + ".txt",
            href: URL.createObjectURL(
            new Blob([$("#ta_target").val()], {
                type: "text/plain"
            }))
        })
        .appendTo("body")[0].click();
        $(window).one("focus", function() {
            $("a").last().remove()
        })
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
    });
    $(document).on('click',".menu__login", function() { 
        $("#menu_login").click();
    });
    $(document).on('click',".menu_signup_link", function(){
        $(".PopupMenu").remove();
        var t = document.querySelector('#sign_MainSection');
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
    });
    $(document).on('click',".menu__login__form__pass__forgot", function(){
        $(".PopupMenu").remove();
        var t = document.querySelector('#ForgotPasswordSection');
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
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
					window.location.assign("/translator");
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
		var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            url: log_out,
            success: function (data, status) {
				window.location.assign("/translator");
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
    $(document).on('click',"#wordDict_help_popup ul", function(e){
        var _content = e.currentTarget.children[0];
        $('#ta_source').val(_content.textContent);
        ShowSentence();
        document.getElementById('wordDict_help_popup').style.display = "none";
    });
    $(document).on('click',"html", function(e){
        document.getElementById('wordDict_help_popup').style.display = "none";
    });
});