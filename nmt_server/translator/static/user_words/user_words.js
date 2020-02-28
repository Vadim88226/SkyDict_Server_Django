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
    $("#view_user_dict").on('click', function(){
        $(".add_words").css('display', 'none');
        $(".user_vocabulary").css('display', 'block');
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
        $('#first_exam').val("");
        $('#second_exam').val("");
        setTimeout(function(){ document.getElementById("first_exam").focus();} , 500);
    });
    $(document).on('click', ".frame .btn_Edit", function(e) { 
        $("#request_frm").val(e.target.offsetParent.id);
        e.target.parentElement.parentElement.classList.add("EditStatus");
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
        _divtool.setAttribute('style', 'width:10%; padding:2px;');

        if($(".EditStatus").length) {
            target = document.getElementsByClassName("EditStatus")[0];
            target.innerHTML = "";
            target.appendChild(_ul);
            target.appendChild(_divtool);
        } else {
            _div.appendChild(_ul);
            _div.appendChild(_divtool);
            _div.setAttribute('style', 'display:flex;padding: 0;margin-bottom:5px;background: aliceblue;');
            target.appendChild(_div);
        }
        $(".close").click();
    });
    $(document).on('click', "#word_vocabulary .btn_Del", function(e) {
        if( !confirm("Do you really delete this sentence?") ) return;
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
    $("#id_chk_agree").on('change', function(e){
        $(".btn_save").attr('disabled', $(this).is(":not(:checked)"));
    })
    $(".btn_save").on('click', function(){ 
        if(!$("#U_name").val()) {window.location.href = "/translator"; return;}
        if($("#id_s_lang").val() == $("#id_t_lang").val()) {
            alert("Source Language equal target language. \n please change!");
            $("#id_t_lang").focus(); return;
        }
        if($("#id_Vocabulary").val().trim() == "") {
            obj_focus("#id_Vocabulary"); return;
        }
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        var chk_boxes = $('#clear input[type=checkbox]');
        var _data = [];
        var data_len = 0;
        for (_chk of chk_boxes) {
            if( $(_chk).is(":not(:checked)")) continue; 
            var _name = $(_chk).val();//console.log($(_chk).parent().text().trim());
            _data[data_len] = [];
            _data[data_len][0] = _name;
            if(_name == "other") {
                _data[data_len][0] = $("#key_other").val().trim();
                if(_data[data_len][0] == "") { obj_focus("#key_other"); return;}
            }
            var _trans = $('#txt_' + _name).val().trim();
            if(_trans == "") {
                obj_focus('#txt_' + _name); return;
            }
            _data[data_len][1] = _trans;
            var _ex = $('#frm_' + _name + ' ul');
            for( i=0; i<_ex.length;i++ ){
                _data[data_len][i+2] = []
                _data[data_len][i+2][0] = _ex[i].children[0].textContent;
                _data[data_len][i+2][1] = _ex[i].children[1].textContent;
            }
            data_len++;
        }   //console.log(_data); return;
        if(data_len == 0) {
            alert("Data is empty! please enter data."); return;
        }
        $.ajax({
            // type: "POST",
            url: add_words_url,
            headers:{
                "X-CSRFToken": csrftoken
            },
            data: {
                'user' : $("#U_name").val(),
                'sl' : $("#id_s_lang").val().toLowerCase().substr(0,2),
                'tl' : $("#id_t_lang").val().toLowerCase().substr(0,2),
                'vocabulary': $("#id_Vocabulary").val().trim(),
                'content' : JSON.stringify(_data)
            },
            dataType: 'json',
            success: function (data) {  
                alert(data.content); window.location = window.location;
            },
            error: function() {
                alert("Server Error!");
            },
        }).always(function(e){
            
        });
    });
    function obj_focus( obj ){
        $(obj).focus();
        $(obj).css('border', '2px dotted red');
        $(obj).attr('placeholder', 'Please Enter');
    }
})