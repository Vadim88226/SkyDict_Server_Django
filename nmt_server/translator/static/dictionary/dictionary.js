var wait, wait1;
var _ajax_communication;

function similar_words() {
	var selectedText = $('#id_find_word').val().trim();
    if (s_text == selectedText) return; 
    s_text = selectedText;
    if(selectedText == "" || selectedText.split(" ").length > 1 || selectedText.split(",").length > 1) {
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

function ShowSelection(selectedText)
{
    selectedText = selectedText.trim();
    var sel = selectedText.split(' ');
    if (sel.length > 1 || selectedText.length == 0) {$(".dict_area").css('display', 'none');return;}
    sel = sel[0].split(',');
    if (sel.length > 1) {$(".dict_area").css('display', 'none');return;}
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
            if (data != "") {
                $(".dict_area").css('display', 'flex');
                var dText = "";
                for(_dict in data.dictionary) {
                    if(data.dictionary[_dict]) {
                        dText += "<div><dictionary>" + _dict + "</dictionary>";
                        dText += data.dictionary[_dict] + "</div>";
                    }
                }
                    dText = dText.replace(/\n/g, "<br>");
                    dText = dText.replace(/  /g, "&nbsp; ");
                    document.getElementById('translator_dict').innerHTML = dText;
                    $(".dictionary_dict_area").css('display' ,  'block');

                dText = "";
                for(_s in data.sentences) {
                    if(data.sentences[_s]) {
                        dText += "<div><copus>" + _s + "</copus>";
                        dText += data.sentences[_s] + "</div>";
                    }
                }
                if(dText) {
                    document.getElementById('translator_sentences').innerHTML = dText;
                    $(".sentence_area").css('display', 'block');
                } else {
                    document.getElementById('translator_sentences').innerHTML = "";
                }
            } else  {
                $(".dict_area").css('display', 'none');
                document.getElementById('translator_dict').innerHTML = "";
                document.getElementById('translator_sentences').innerHTML = "";
            }
        },
        error: function() {
            $(".dict_area").css('display', 'none');
        },
        timeout: 2000
    });
}
$(function(){
    $('#id_find_word').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        suggest_navigation_keys_check(e);
        if(keycode != 13 && keycode != 32) { //console.log(keycode);
            clearTimeout(wait1);
            wait1 = setTimeout(similar_words, 200);
        } else {
            $(".btn_search").click();
        }
    });
    $('#id_find_word').on('change', function(e) {
        ShowSelection($('#id_find_word').val());
    });
    $(document).on('click',"#wordDict_help_popup ul", function(e){
        var _content = e.currentTarget.children[0];
        $('#id_find_word').val(_content.textContent);
        $(".btn_search").click();
    });
    $(document).on('click',"html", function(e){
        document.getElementById('wordDict_help_popup').style.display = "none";
    });
    $(".btn_search").on('click', function(){
        s_text = $('#id_find_word').val()
        ShowSelection(s_text);
        document.getElementById('wordDict_help_popup').style.display = "none"
        $("#view_dict_area").click();
    })
    $(document).on('dblclick', "kref", function(e){
        var _content = e.currentTarget;
        $('#id_find_word').val(_content.textContent);
        $(".btn_search").click();
    })
    $(".btn_sound").on('click', function(){
        $("#sound_src").attr("src", "../static/sound.mp3");
	    $(".my_audio").trigger('load');$(".my_audio").trigger('play');
    })
    $("#more_sentences").on('click', function(){
        $(".sentence_more").css('display', 'block');
        $("#more_sentences").css('display', 'none');
    })
    $("#few_sentences").on('click', function(){
        $(".sentence_more").css('display', 'none');
        $("#more_sentences").css('display', 'block');
    })
    $(document).on('click', "copus, dictionary", function(e){
        var _cont = e.target.parentElement; _cont.className = "animate";
        if( _cont.style.height == "") {
            _cont.style.height = "100px";
        } else {
            _cont.style.height = "";
        }

    })
})