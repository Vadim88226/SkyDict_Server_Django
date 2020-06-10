var s_text = "";
var _ajax_communication = false;

function similar_words() {
	var selectedText = $('#id_searchWord').val();
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
        success: function (data) {
            if(selectedText != $('#id_searchWord').val()) return;
            if(data.content) {
                document.getElementById('wordDict_help_popup').innerHTML = data.content; 
                document.getElementById('wordDict_help_popup').style.display = "block";
                _ajax_communication = false;
            } else {
                document.getElementById('wordDict_help_popup').style.display = "none"; 
                _ajax_communication = false;
            }
        },
        error: function() {
            document.getElementById('wordDict_help_popup').style.display = "none"; 
            _ajax_communication = false;
        },
        timeout: 1000,
    }).always(function(e){
      
        _ajax_communication = false;
    });
}

function ShowSelection(selectedText)
{
    // selectedText = selectedText.trim();
    var sel = selectedText.split(' ');
    if (sel.length > 1 || selectedText.length == 0) return;
    sel = sel[0].split(',');
    if (sel.length > 1) return;
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
            if($('#id_searchWord').val() != selectedText) return;
            if (data != "") {
                $(".dict_area").css('display', 'flex');
                var dText = "";
                for(_dict in data.dictionary) {
                    if(data.dictionary[_dict]) {
                        dText += "<div><dictionary>" + _dict + "</dictionary><div class='content'>";
                        dText += data.dictionary[_dict] + "</div></div>";
                    }
                }
                    dText = dText.replace(/\n/g, "<br>");
                    dText = dText.replace(/  /g, "&nbsp; ");
                    document.getElementById('translator_dict').innerHTML = dText;
                    $(".dictionary_dict_area").css('display' ,  'block');

                dText = "";
                for(_s in data.sentences) {
                    if(data.sentences[_s]) {
                        dText += "<div><copus>" + _s + "</copus><div class='content'>";
                        dText += data.sentences[_s] + "</div></div>";
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
            // $(".dict_area").css('display', 'none');
        },
        timeout: 2000
    });
}
$(function(){
    $('#id_searchWord').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        suggest_navigation_keys_check(e);
        if(keycode != 13 && keycode != 32) {
            clearTimeout(wait1);
            wait1 = setTimeout(similar_words, 200);
        } else {
            $(".btn_search").click();
        }
    });
    $('#id_searchWord').on('change', function(e) {
        ShowSelection($('#id_searchWord').val());
    });
    $(document).on('click',"#wordDict_help_popup ul", function(e){
        var _content = e.currentTarget.children[0];
        $('#id_searchWord').val(_content.textContent);
        $(".btn_search").click();
    });
    $(document).on('click',"html", function(e){
        document.getElementById('wordDict_help_popup').style.display = "none";
    });
    $(".btn_search").on('click', function(){
        ShowSelection($('#id_searchWord').val());
        document.getElementById('wordDict_help_popup').style.display = "none"
        $("#view_dict_area").click();
    })
    $(document).on('dblclick', "kref", function(e){
        var _content = e.currentTarget;
        $('#id_searchWord').val(_content.textContent);
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
        $(".animate").removeClass("animate");
        var _cont = e.target.parentElement; _cont.className = "animate";
        if( _cont.style.height != "27px") {
            if(!_cont.getAttribute("_h")) _cont.setAttribute("_h", _cont.offsetHeight);
            $(".animate").animate({ height:"27px" }, 10 );
            e.target.style.backgroundPosition = "3px -214px";
        } else {
            e.target.style.backgroundPosition = "";
            $(".animate").animate({ height:_cont.getAttribute("_h")+"px" }, 10 );
        }
    })
})