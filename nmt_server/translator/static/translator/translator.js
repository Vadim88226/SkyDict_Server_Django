var source_language = "English";
var target_language = "Thai";
var api_url = "trans_sentences";
var dict_url = 'query_dict'
var selector = '.nav li';

$(selector).on('click', function(){
    alert(selector)
    $(selector).removeClass('active');
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
        url: dict_url,
        data: {
          'seltext': selectedText,
          'inLang' : source_language,
          'outLang' : target_language
        },
        dataType: 'json',
        success: function (data) {
            if (data.content != "") {
                $(".dict_area").css('display', 'block');
                var dText = data.content;
                dText = dText.replace(/\n/g, "<br>");
                dText = dText.replace(/  /g, "&nbsp;"); console.log(dText);
                document.getElementById('translator_dict').innerHTML = dText;
            }
        }
    });
}

function ShowSentence()
{
    var selectedText = $('#ta_source').val().trim();
    if (selectedText.length == 0) return;
    $.ajax({
        url: api_url,
        data: {
          'seltext': selectedText,
          'inLang' : source_language,
          'outLang' : target_language
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
    ShowSentence();
}
function source_textarea_change() {
    $('.source_textarea').css('height', 'auto');
    if( $('.source_textarea').val() ) 
        $('.textarea_placeholder_text').css("display", "none");
    else
        $('.textarea_placeholder_text').css("display", "block");
    var height = document.getElementById('ta_source').scrollHeight;
        $('.source_textarea').css("font-size", 22 - height/500);
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
        $('.textarea_placeholder_text').css("display", "block");
    });
    $('.source_textarea').on('keydown keyup paste mouseup change', function (e) {
        //clearTimeout($.data(this, 'timer'));
        var wait = setTimeout(source_textarea_change, 100);
        $(this).data('timer', wait);
    });
    $('.source_textarea').on('select', function(e) {
        ShowSelection();
    });
    $('.source_textarea').on('keyup', function(e) {
        clearTimeout($.data(this, 'timer'));
        var wait = setTimeout(ShowSentence, 500);
        $(this).data('timer', wait);
    });
    $('.docTrans_translator_upload_button__inner_button').on('click', function () {
        $('#docTrans').click();        
    });
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
    $(".clear_dict_text").on('click', function(e){
        $(".dict_area").css('display', 'none');
    });
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
        // select
        var t = document.querySelector('#dlMainPopup');
        /*
        // set
        t.content.querySelector('img').src = 'demo.png';
        t.content.querySelector('p').textContent= 'demo text';*/
        
        // add to document DOM
        var clone = document.importNode(t.content, true); // where true means deep copy
        document.body.appendChild(clone);
    });
});
