function ShowVocabulary()
{
    var selectedText = $('#id_find_word').val().trim();
    $.ajax({
        url: vocabulary_list,
        data: {
            'seltext': selectedText,
            'is_approved': document.querySelector('input[name="allowed"]:checked').value
        },
        dataType: 'json',
        success: function (data) {
            if (data != "") {
                if(data.length == 0) {
                    return;
                } else {
                    document.getElementById("list_vocabulary").innerHTML="";
                    for( _d in data ) {
                        _ul = document.createElement("ul");
                        _ul.textContent = data[_d]["word"];
                        _ul.setAttribute('user', data[_d]['user']);
                        document.getElementById("list_vocabulary").appendChild(_ul);
                    }
                }
                $("#content_add_words").css('display', 'none');
                $("#content_user_vocabulary").css('position', 'relative'); 
                $("#content_user_vocabulary").css('height', '100%'); 
                $("#content_user_vocabulary").css('visibility', 'visible'); 
            } else  {
                
            }
        },
        error: function() {
            $.alert({
                title: 'Alert', content: 'SERVER ERROR',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: {  }
                }
            });
        },
        timeout: 2000
    });
}
$(function(){
    $('#id_find_word').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if(keycode == 13) {
            $(".btn_search").click();
        }
    });
    $('#id_find_word').on('change', function(e) {
        ShowVocabulary();
    });
    $('input[type=radio][name=allowed]').change(function() {
        if(document.querySelector('input[name="allowed"]:checked').value == 1) {
            $('.div_approved').css('border-style', 'solid solid none solid');
            $('.div_unapproved').css('border-style', 'none none solid none');
            $(".btn_approve").css('visibility', 'hidden');
        } else {
            $('.div_approved').css('border-style', 'none none solid none');
            $('.div_unapproved').css('border-style', 'solid solid none solid');
            $(".btn_approve").css('visibility', 'visible');
        }
        ShowVocabulary();
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
        ShowVocabulary();
    })
    $("#view_add_word").on('click', function(){
        $("#content_user_vocabulary").css('visibility', 'hidden');
        $("#content_user_vocabulary").css('position', 'fixed'); 
        $("#content_user_vocabulary").css('height', 0); 
        $("#content_add_words").css('display', 'block');
    })
    $("#view_user_dict").on('click', function(){
        ShowVocabulary();
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
            // console.log(document.getElementById("frm_" + name));
            _parent.removeChild(document.getElementById("frm_" + name));
        }
    });
    $(document).on('click', ".frame .btn_add", function(e) {
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
        _ul.setAttribute('style', 'width: calc(100% - 50px);');
        var _divtool = document.createElement('div');
        var _btnEdit = document.createElement('button');
        var _btnDel = document.createElement('button');
        _btnEdit.setAttribute('class', 'btn_Edit glyphicon glyphicon-pencil');
        _btnEdit.setAttribute('data-toggle',"modal");
        _btnEdit.setAttribute('data-target', "#myModal");
        _btnDel.setAttribute('class', 'btn_Del glyphicon glyphicon-remove');
        _divtool.appendChild(_btnEdit);
        _divtool.appendChild(_btnDel);
        _divtool.setAttribute('style', 'width:50px; padding:2px;');

        if($(".EditStatus").length) {
            target = document.getElementsByClassName("EditStatus")[0];
            target.innerHTML = "";
            target.appendChild(_ul);
            target.appendChild(_divtool);
            target.classList.remove("EditStatus");
            if($('#request_frm').val().substr(0,4) == "frm1"){
                // update sentence
                $.ajax({
                    url: update_sentence,
                    headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
                    data: {
                        'sent_id': target.getAttribute("sent_id"),
                        's_sentence': f_text,
                        't_sentence': s_text
                    },
                    dataType: 'json',
                    success: function (data) {
                        // console.log(data);
                    },
                    error: function() {
                        $.alert({
                            title: 'Alert', content: 'SERVER ERROR',
                            icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                            buttons: {
                                okay: {  }
                            }
                        });
                    },
                    timeout: 2000
                });
            }
        } else {
            _div.appendChild(_ul);
            _div.appendChild(_divtool);
            _div.setAttribute('style', 'display:flex;padding: 0;margin-bottom:5px;background: aliceblue;');
            target.appendChild(_div);
        }
        $(".close").click();
    });
    $(document).on('click', ".frame .btn_Del", function(e) {
        $.confirm({
            title: 'Delete Sentences',
            content: 'Are you sure you want to delete these sentences?.',
            icon: 'fa fa-question-circle',
            animation: 'scale',
            closeAnimation: 'scale',
            opacity: 0.5,
            closeIcon:true,
            buttons: {
                'confirm': {
                    text: 'Yes',
                    action: function(){
                        _exam = e.target.parentElement.parentElement;
                        _frm = e.target.parentElement.parentElement.parentElement; //console.log(_frm.id);
                        if(_frm.id.substr(0,4) == "frm1") {
                            // delete sentence
                            $.ajax({
                                url: delete_sentence,
                                headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
                                data: {
                                    'sent_id': _exam.getAttribute("sent_id")
                                },
                                dataType: 'json',
                                success: function (data) {
                                    // console.log(data);
                                    _frm.removeChild(_exam);
                                },
                                error: function() {
                                    $.alert({
                                        title: 'Alert', content: 'SERVER ERROR',
                                        icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                                        buttons: {
                                            okay: {  }
                                        }
                                    });
                                },
                                timeout: 2000
                            });
                        } else {
                            _frm.removeChild(_exam);
                        }
                    }
                },
                cancel: { text:'No'
                },
            }
        });
        
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
            $.alert({
                title: 'Alert', content: "Source and target language is equal. <br> Please change!",
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                autoClose: 'okay|3000',
                buttons: {
                    okay: {  }
                }
            });
            $("#id_t_lang").focus(); return;
        }
        if($("#id_Vocabulary").val().trim() == "") {
            obj_focus("#id_Vocabulary"); return;
        }
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
            $.alert({
                title: 'Alert', content: "Data is empty. <br> Please enter data.",
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                autoClose: 'okay|3000',
                buttons: {
                    okay: {  }
                }
            });
            return;
        }
        $.ajax({
            url: vocabulary_list,
            data: {
                'seltext': $("#id_Vocabulary").val().trim(),
                'is_approved': 2
            },
            dataType: 'json',
            success: function (data) {
                if(data[0]) {
                    $.confirm({
                        title: 'Add Words', content: 'This word exists in User Dictionary.<br> Are you sure you want to add this word?',
                        icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                        buttons: {
                            okay: { 
                                text:'Yes',
                                action: function() {
                                    add_words_database(_data)
                                }
                            },
                            cancel:{ text: 'No'}
                        }
                    })
                } else {
                    add_words_database(_data);
                }
            }
        })
    });
    function add_words_database(_data){
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            url: add_words_url,
            headers:{ "X-CSRFToken": csrftoken  },
            data: {
                'user' : $("#U_name").val(),
                'sl' : $("#id_s_lang").val().toLowerCase().substr(0,2),
                'tl' : $("#id_t_lang").val().toLowerCase().substr(0,2),
                'vocabulary': $("#id_Vocabulary").val().trim(),
                'content' : JSON.stringify(_data)
            },
            dataType: 'json',
            success: function (data) {  
                $.confirm({
                    icon: 'fa fa-smile-o',
                    theme: 'modern', content: data.content,
                    animation: 'scale',
                    type: 'blue',
                    autoClose: 'okay|3000',
                    escapeKey: 'okay',
                    buttons: {
                        okay: {
                            action: function(){
                                window.location = "/user_words/index";
                            }
                        }
                    }
                });
            },
            error: function() {
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
            },
        }).always(function(e){
            
        });
    }
    function obj_focus( obj ){
        $(obj).focus();
        $(obj).css('border', '2px solid red');
        $(obj).attr('placeholder', 'Please Enter');
    }
    $(document).on('click', "#list_vocabulary ul", function(e) {
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            // type: "POST",
            url: query_user_dictionary,
            headers:{
                "X-CSRFToken": csrftoken
            },
            data: {
                'user' : e.target.attributes["user"].value,
                'seltext': e.target.textContent,
                'is_approved': document.querySelector('input[name="allowed"]:checked').value
            },
            dataType: 'json',
            success: function (data) {
                if(data.length == 0) return;
                $('.add_words').css('display', 'block');
                document.getElementById("view_word").textContent = e.target.textContent;
                document.getElementById("view_word").setAttribute('user', data[0]["user"]);
                // console.log(data);
                var target = document.getElementById('db_vocabulary');
                target.innerHTML = "";
                for (_d in data) { 
                    var name = data[_d]["part"];
                    var _div = document.createElement('div');
                    _div.id = "frm1_" + name;
                    _div.setAttribute('word_id', data[_d]["word_id"]);
                    _div.setAttribute('class', 'frame');
                    var _label = document.createElement('label');
                    _label.textContent = name;
                    _label.setAttribute('class', 'frm_label');
                    _div.appendChild(_label);
                    var labelExample;
                    
                    labelExample = document.createElement("label");
                    labelExample.textContent = "Translation:";
                    labelExample.setAttribute('class', 'txtlabel');
                    _div.appendChild(labelExample);
        
                    var input = document.createElement("textarea");
                    input.id = 'txt_' + name;
                    input.value = data[_d]['trans'];
                    _div.appendChild(input);
                    if(data[_d]['sentences']) {
                        labelExample = document.createElement("label");
                        labelExample.textContent = "Example Sentences:";
                        labelExample.setAttribute('class', 'txtlabel');
                        _div.appendChild(labelExample);
            
                        var btn_add = document.createElement("button");
                        btn_add.setAttribute('class', 'btn_add glyphicon glyphicon-plus');
                        btn_add.setAttribute('data-toggle',"modal");
                        btn_add.setAttribute('data-target', "#myModal");
                        // _div.appendChild(btn_add);
                        for(_s in data[_d]['sentences']){
                            var _div1 = document.createElement('div');
                            var _ul = document.createElement('ul');
                            var _fli = document.createElement('li');
                            var _sli = document.createElement('li');
                            _fli.textContent = data[_d]['sentences'][_s]['s_sentence'];
                            _sli.textContent = data[_d]['sentences'][_s]['t_sentence'];
                            _ul.appendChild(_fli);
                            _ul.appendChild(_sli);
                            _ul.setAttribute('style', 'width:calc(100% - 50px);');
                            var _divtool = document.createElement('div');
                            var _btnEdit = document.createElement('button');
                            var _btnDel = document.createElement('button');
                            _btnEdit.setAttribute('class', 'btn_Edit glyphicon glyphicon-pencil');
                            _btnEdit.setAttribute('data-toggle',"modal");
                            _btnEdit.setAttribute('data-target', "#myModal");
                            _btnDel.setAttribute('class', 'btn_Del glyphicon glyphicon-remove');
                            _divtool.appendChild(_btnEdit);
                            _divtool.appendChild(_btnDel);
                            _divtool.setAttribute('style', 'width:50px; padding:2px;');

                            _div1.appendChild(_ul);
                            _div1.appendChild(_divtool);
                            _div1.setAttribute('style', 'display:flex;padding: 0;margin-bottom:5px;background: aliceblue;');
                            _div1.setAttribute('sent_id', data[_d]['sentences'][_s]["sent_id"]);
                            _div.appendChild(_div1);
                        }
                    }
                    target.appendChild(_div);
                }
                
            },
            error: function() {
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
            },
        }).always(function(e){
            
        });
    });
    $(document).on('change', "#db_vocabulary textarea", function(e) {
        // update vocabulary
        $.ajax({
            url: update_vocabulary,
            headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
            data: {
                'word_id': e.target.parentElement.getAttribute("word_id"),
                'trans': this.value
            },
            dataType: 'json',
            success: function (data) {
                $.confirm({
                    icon: 'fa fa-smile-o',
                    theme: 'modern', content: data.content,
                    animation: 'scale', type: 'blue',
                    autoClose: 'okay|2000', escapeKey: 'okay',
                    buttons: {
                        okay: {  }
                    }
                });
            },
            error: function() {
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
            },
            timeout: 2000
        });
    });
    $(".btn_approve").on('click', function(){  
        var _obj = document.getElementById("view_word");
        if(_obj.textContent == "") return;
        $.ajax({
            url: approve_vocabulary,
            headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
            data: {
                'word': _obj.textContent,
                'user': _obj.getAttribute("user")
            },
            dataType: 'json',
            success: function (data) {
                $.confirm({
                    icon: 'fa fa-smile-o',
                    theme: 'modern', content: data.content, title: "Success!", 
                    animation: 'scale', type: 'blue',
                    autoClose: 'okay|3000', escapeKey: 'okay',
                    buttons: {
                        okay: { 
                            action: function(){
                                ShowVocabulary();
                             }
                        }
                    }
                });
            },
            error: function() {
                $.alert({
                    title: 'Alert', content: 'SERVER ERROR',
                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                    buttons: {
                        okay: {  }
                    }
                });
            },
            timeout: 2000
        });
    });
    $(".btn_delete").on('click', function(){ 
        var _obj = document.getElementById("view_word");
        if(_obj.textContent == "") return;
        $.confirm({
            title: 'Delete vocabulary', content: 'Are you sure you want to delete this vocabulary?',
            icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
            buttons: {
                okay: { text:'Yes',
                    action: function(){
                        $.ajax({
                            url: delete_vocabulary,
                            headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
                            data: {
                                'word': _obj.textContent,
                                'user': _obj.getAttribute("user")
                            },
                            dataType: 'json',
                            success: function (data) {
                                $.confirm({
                                    icon: 'fa fa-smile-o',
                                    theme: 'modern',title: 'Success!', content: data.content,
                                    animation: 'scale',
                                    type: 'blue',
                                    autoClose: 'okay|3000',
                                    escapeKey: 'okay',
                                    buttons: {
                                        okay: { 
                                            action: function(){
                                                ShowVocabulary();
                                                document.getElementById("view_word").innerHTML="";
                                                document.getElementById("db_vocabulary").innerHTML="";
                                                $(".add_words").css('display', 'none');
                                            }
                                        }
                                    }
                                });
                            },
                            error: function() {
                                $.alert({
                                    title: 'Alert', content: 'SERVER ERROR',
                                    icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                                    buttons: {
                                        okay: {  }
                                    }
                                });
                            },
                            timeout: 2000
                        });
                    }
                },
                cancel :{text:'No'}
            }
        });
    });
    if (suburl == 'dict')  ShowVocabulary();
})