var source_language = "English";
var target_language = "Thai";
var api_url = "trans_sentences";
var dict_url = 'query_dict'
var signup_url = 'sign_up/';
var login_url = 'log_in';
var forgot_url = 'forgot';
var wait;
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
        url: dict_url,
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
                console.log(data.content);
                $(".dict_area").css('display', 'none');
            }
        }
    });
}

function ShowSentence()
{
    var selectedText = $('#ta_source').val().trim();
    if (selectedText.length == 0) return;
    $.ajax({
        // type: "POST",
        url: api_url,
        data: {
          'seltext': selectedText,
          'sl' : source_language.toLowerCase().substr(0,2),
          'tl' : target_language.toLowerCase().substr(0,2)
        },
        dataType: 'json',
        success: function (data) {  //console.log(data);
            $("#ta_target").val(data.content);
        },
        
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
    $('.source_textarea').css('height', 'auto');
    // if( $('.source_textarea').val() ) 
    //     $('.textarea_placeholder_text').css("display", "none");
    // else
    //     $('.textarea_placeholder_text').css("display", "block");
    var len = $('.source_textarea').val().length.toString();
    document.getElementById("docTrans_char_count").innerHTML = $('.source_textarea').val().length.toString() + "/5000";
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
        clearTimeout(wait);
        wait = setTimeout(ShowSentence, 500);
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
        var rememberme = $("#sign_rememberme").val();
        if(!email || !firstname || !lastname)  {
            document.getElementById("menu__error").innerHTML  = "Input correct data!";
            return;
        }
        if(pwd != sign_confirm || pwd == "") {
            document.getElementById("menu__error").innerHTML = "Incorrect Password!";
            return;
        }
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();

        $.ajax({
            type: "POST",
            url: signup_url,
            headers:{
                "X-CSRFToken": csrftoken
            },
            data: {
                'email': email,
                'username': uId,
                'first_name': firstname,
                'last_name': lastname,
                'password1': pwd,
                'password2': sign_confirm,
            },
            dataType: 'json',
            cache: true,
            success: function (data, status) {
                document.getElementById('menu__error').innerHTML = data.content;
            }
        });
    });
    $(document).on('click',".menu__login__form__submit", function(){
        var email = $("#login_email").val();
        var pwd = $("#login_password").val();
        var rememberme = $("#sign_rememberme").val();
        if(!email || !pwd)  {
            document.getElementById("menu__error").innerHTML  = "Input correct data!";
            return;
        }
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        console.log(csrftoken)

        $.ajax({
            
            url: login_url,
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
                } else {
                    document.getElementById('menu__error').innerHTML = data.content;
                }
            }
        });
    });
});