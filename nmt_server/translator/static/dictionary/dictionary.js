var wait, wait1;
var _ajax_communication;

function similar_words() {
	var selectedText = $('#id_find_word').val().trim();
    if (s_text == selectedText) return; s_text = selectedText;
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
$(function(){
    $('#id_find_word').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if(keycode==13 || keycode==32) {
            $(".btn_search").click(); return;
        }
        clearTimeout(wait1);
        wait1 = setTimeout(similar_words, 200);
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
        ShowSelection($('#id_find_word').val());
        document.getElementById('wordDict_help_popup').style.display = "none"
    })
    $(document).on('dblclick', "kref", function(e){
        var _content = e.currentTarget;
        $('#id_find_word').val(_content.textContent);
        $(".btn_search").click();
    })
})