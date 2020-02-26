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
            if (data.content != "") {
                $(".dict_area").css('display', 'flex');
                var dText = data.content;
                dText = dText.replace(/\n/g, "<br>");
                dText = dText.replace(/  /g, "&nbsp; ");
                document.getElementById('translator_dict').innerHTML = dText;
                $(".dictionary_dict_area").css('display' ,  'block');
                dText = data.sentences;
                document.getElementById('translator_sentences').innerHTML = "";
                $(".sentence_more").css('display', 'none');
                $("#more_sentences").css('display', 'none');
                if(dText) {
                    document.getElementById('translator_sentences').innerHTML = dText;
                    $(".sentence_area").css('display', 'block');
                    var dText1 = data.sentences_more;
                    if(dText1) {
                        document.getElementById('translator_sentences1').innerHTML = dText1;
                        $("#more_sentences").css('display', 'block');
                    }
                }
            } else  {
                $(".dict_area").css('display', 'none');
                document.getElementById('translator_dict').innerHTML = "";
                document.getElementById('translator_sentences').innerHTML = "";
                $("#more_sentences").css('display', 'none');
                $(".sentence_more").css('display', 'none');
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
    $("#view_dict_area").on('click', function(){
        $(".dict_area").css('display', 'block');
        $(".add_words").css('display', 'none');
    })
    $("#view_add_word").on('click', function(){
        $(".dict_area").css('display', 'none');
        $(".add_words").css('display', 'block');
    })
    $(".add_words li").on('click', function(e){
        if(e.target.type != 'checkbox') return;
        _parent = document.getElementById('word_vocabulary');
        var name = e.target.value;
        if(e.target.checked == true) {
            var _div = document.createElement('div');
            _div.id = "frm_" + name;
            _div.setAttribute('class', 'frame');
            var _label = document.createElement('label');
            _label.textContent = e.currentTarget.textContent.trim();
            _label.setAttribute('class', 'frm_label');
            _div.appendChild(_label);
            var labelExample;

            if(name == "other") {
                labelExample = document.createElement("label");
                labelExample.textContent = "type:";
                labelExample.setAttribute('class', 'txtlabel');
                _div.appendChild(labelExample)
                var tInput = document.createElement('input')
                tInput.id = 'key_' + name;
                _div.appendChild(tInput)
                _div.appendChild(document.createElement("br"));
            }
            
            labelExample = document.createElement("label");
            labelExample.textContent = "Translation:";
            labelExample.setAttribute('class', 'txtlabel');
            _div.appendChild(labelExample);

            var input = document.createElement("textarea");
            input.id = 'txt_' + name;
            _div.appendChild(input);

            labelExample = document.createElement("label");
            labelExample.textContent = "Example Sentences:";
            labelExample.setAttribute('class', 'txtlabel');
            _div.appendChild(labelExample);

            var btn_add = document.createElement("button");
            // btn_add.textContent='+';
            btn_add.setAttribute('class', 'btn_add glyphicon glyphicon-plus');
            btn_add.setAttribute('data-toggle',"modal");
            btn_add.setAttribute('data-target', "#myModal");
            _div.appendChild(btn_add);
            
            // var inputExample = document.createElement("textarea");
            // inputExample.id = 'exm_' + name;
            // _div.appendChild(inputExample);

            // var div_exam = document.createElement('div');
            // div_exam.id = "exam_" + name;
            // _div.appendChild(div_exam);
            _parent.appendChild(_div);
        } else {
            console.log(document.getElementById("frm_" + name));
            _parent.removeChild(document.getElementById("frm_" + name));
        }
    });
    $(document).on('click', "#word_vocabulary .btn_add", function(e) {
        $("#request_frm").val(e.target.offsetParent.id);
        $("#modal-title").html("Please enter example sentence for " + e.target.offsetParent.children[0].textContent);
        setTimeout(function(){ document.getElementById("first_exam").focus();} , 500);
    });
    $(document).on('click', "#word_vocabulary .btn_Edit", function(e) {
        $("#request_frm").val(e.target.offsetParent.id);
        $("#modal-title").html("Please enter example sentence for " + e.target.offsetParent.children[0].textContent);
        _so = e.target.parentElement.parentElement;
        $('#first_exam').val(e.target.parentElement.parentElement.childNodes[0].children[0].textContent);
        $('#second_exam').val(e.target.parentElement.parentElement.childNodes[0].children[1].textContent);
        setTimeout(function(){ document.getElementById("first_exam").focus();} , 500);
    });
    $('.btn-add').on('click', function(){
        // var target = $('#'+$('#request_frm').val()); 
        var target = document.getElementById($('#request_frm').val()); 
        var f_text = $('#first_exam').val();
        var s_text = $('#second_exam').val();
        if(!f_text || !s_text) return;
        var _div = document.createElement('div');
        var _ul = document.createElement('ul');
        var _fli = document.createElement('li');
        var _sli = document.createElement('li');
        _fli.textContent = f_text;
        _sli.textContent = s_text;
        _ul.appendChild(_fli);
        _ul.appendChild(_sli);
        _ul.setAttribute('style', 'width:90%;');
        var _divtool = document.createElement('div');
        var _btnEdit = document.createElement('button');
        var _btnDel = document.createElement('button');
        _btnEdit.setAttribute('class', 'btn_Edit glyphicon glyphicon-pencil');
        _btnEdit.setAttribute('data-toggle',"modal");
        _btnEdit.setAttribute('data-target', "#myModal");
        _btnDel.setAttribute('class', 'btn_Del glyphicon glyphicon-remove');
        _divtool.appendChild(_btnEdit);
        _divtool.appendChild(_btnDel);
        _divtool.setAttribute('style', 'width:10%;');
        _div.appendChild(_ul);
        _div.appendChild(_divtool);
        _div.setAttribute('style', 'display:flex;');
        target.appendChild(_div);
        $('#first_exam').val("");
        $('#second_exam').val("");
        $(".close").click();
    });
    $(document).on('click', "#word_vocabulary .btn_Del", function(e) {
        _exam = e.target.parentElement.parentElement;
        _frm = e.target.parentElement.parentElement.parentElement;
        _frm.removeChild(_exam);
    });
    $("#btn_vtype").on('click', function(){ 
        if ($('#clear').css('display') =='none') {
            $('#clear').css('display', 'flex');
            $('#btn_vtype').css('color', '#0F2B46' )
            $('#btn_vtype').css('background-position', 'center bottom !important;');
            document.getElementById('btn_vtype').style.backgroundPosition = 'center bottom';
        } else {
            $('#clear').css('display', 'none');
            $('#btn_vtype').css('color', 'white' );
            document.getElementById('btn_vtype').style.backgroundPosition = 'center top';
        }
    });
    $(".btn_save").on('click', function(){ alert("yet not!"); return;
        $.ajax({
            type: "POST",
            url: add_words_url,
            data: {
                // 'seltext': selectedText,
                // 'sl' : source_language.toLowerCase().substr(0,2)
            },
            dataType: 'json',
            success: function (data) {  //console.log(data);
                // if(data.content) {
                //     document.getElementById('wordDict_help_popup').innerHTML = data.content; 
                //     document.getElementById('wordDict_help_popup').style.display = "block";
                //     _ajax_communication = false;
                // } else {
                //     document.getElementById('wordDict_help_popup').style.display = "none"; //console.log("empty");
                //     _ajax_communication = false;
                // }
            },
            error: function() {
                // document.getElementById('wordDict_help_popup').style.display = "none"; //console.log("error");
                // _ajax_communication = false;
            },
            timeout: 1000,
        }).always(function(e){
            // console.log(_ajax_communication);
            // _ajax_communication = false;
        });
    })
})