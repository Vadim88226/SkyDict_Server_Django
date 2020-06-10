var s_text = "", similar_text = "";
var flag_lexitron_load = false;
var end_lexitron = 0;

function ShowVocabulary(_mode)
{
    if(!_mode) {
        end_lexitron = 0;
        flag_lexitron_load = false;
    }
    if(flag_lexitron_load) return;
    var selectedText = $('#id_searchWord').val().trim();
    $.ajax({
        url: query_UserDictionaryList,
        data: {
            'seltext': selectedText,
            's_lang' : $("#id_s_lang").val().toLowerCase().substr(0,2),
            't_lang' : $("#id_t_lang").val().toLowerCase().substr(0,2),
            'is_approved': 2,
            'end_id': end_lexitron
        },
        dataType: 'json',
        success: function (response) {
            if (response != "") {
                if(response.content.length == 0) {
                    return;
                } else {
                    if(!_mode) document.getElementById("list_lexitron").innerHTML="";
                    data = response.content;
                    for( _d in data ) {
                        end_lexitron = data[_d]['mid'];
                        _ul = document.createElement("ul");
                        _ul.textContent = data[_d]["word"];
                        _ul.setAttribute('user', data[_d]['user']);
                        document.getElementById("list_lexitron").appendChild(_ul);
                    }
                    if(data.length < 50) flag_lexitron_load = true;
                }
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
    $('#id_searchWord').on('keyup', function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if(keycode == 13) {
            $(".btn_search").click();
        }
    });
    // $('#id_searchWord').on('change', function(e) {
    //     $(".btn_search").click();
    // });
    $(".btn_search").on('click', function(){
        ShowVocabulary(0);
    });
    $("#part li").on('click', function(e){
        if(e.target.type != 'checkbox') return;
        _parent = document.getElementById('db_vocabulary');
        var name = e.target.value;

            var _div = document.createElement('div');
            _div.id = "frm_" + name;
            _div.setAttribute('class', 'frame');
            _div.setAttribute('word_id', 0);
            var _label = document.createElement('label');
            _label.textContent = e.currentTarget.textContent.trim();
            _label.setAttribute('class', 'frm_label');
            _div.appendChild(_label);
            var _btnRemove = document.createElement('button');
            _btnRemove.setAttribute('class', 'close glyphicon glyphicon-remove');
            _div.appendChild(_btnRemove);
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

            var labelTrans = document.createElement("label");
            labelTrans.setAttribute('class', 'txtlabel');
            labelTrans.textContent = "Translation:";
            var inputTrans = document.createElement("textarea");
            inputTrans.id = 'trans_' + name;
            _div.appendChild(labelTrans);
            _div.appendChild(inputTrans);

            var labelRelated = document.createElement("label");
            labelRelated.setAttribute('class', 'txtlabel');
            labelRelated.textContent = "Related:";
            var inputRelated = document.createElement("textarea");
            inputRelated.id = 'related_' + name;
            _div.appendChild(labelRelated);
            _div.appendChild(inputRelated);

            var labelSynonym = document.createElement("label");
            labelSynonym.setAttribute('class', 'txtlabel');
            labelSynonym.textContent = "Synonym:";
            var inputSynonym = document.createElement("textarea");
            inputSynonym.id = 'synonym_' + name;
            _div.appendChild(labelSynonym);
            _div.appendChild(inputSynonym);

            var labelAntonym = document.createElement("label");
            labelAntonym.setAttribute('class', 'txtlabel');
            labelAntonym.textContent = "Antonym:";
            var inputAntonym = document.createElement("textarea");
            inputAntonym.id = 'antonym_' + name;
            _div.appendChild(labelAntonym);
            _div.appendChild(inputAntonym);

            labelExample = document.createElement("label");
            labelExample.textContent = "Example Sentences:";
            labelExample.setAttribute('class', 'txtlabel');
            _div.appendChild(labelExample);

            var btn_add = document.createElement("button");
            btn_add.setAttribute('class', 'btn_add glyphicon glyphicon-plus');
            btn_add.setAttribute('data-toggle',"modal");
            btn_add.setAttribute('data-target', "#myModal");
            _div.appendChild(btn_add);
            _parent.appendChild(_div);
    });
    $(document).on('click', ".frame .close", function(e){
        _parent = e.target.parentElement;
        if(_parent.getAttribute('word_id') > 0){
            $.confirm({
                title: 'Delete Part', content: 'Are you sure you want to delete this part?',
                icon: 'fa fa-rocket', animation: 'scale', closeAnimation: 'scale',
                buttons: {
                    okay: { text:'Yes',
                        action: function(){
                            $.ajax({
                                url: delete_vocabulary,
                                headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
                                data: {
                                    'id': _parent.getAttribute('word_id')
                                },
                                dataType: 'json',
                                success: function (data) {
                                    _parent.parentElement.removeChild(e.target.parentElement);
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
        } else {
            _parent.parentElement.removeChild(e.target.parentElement);
        }
    })
    $(document).on('click', ".frame .btn_add", function(e) {
        $("#request_frm").val(e.target.offsetParent.id);
        e.target.parentElement.classList.add("AddStatus");
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
    $('#myModal .btn-add').on('click', function(){
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
            _ul.setAttribute('sent_id',target.querySelector('ul').getAttribute('sent_id'));
            target.innerHTML = "";
            target.appendChild(_ul);
            target.appendChild(_divtool);
            target.classList.remove("EditStatus");
        } else {
            target = document.getElementsByClassName("AddStatus")[0];
            _ul.setAttribute('sent_id',0);
            _div.appendChild(_ul);
            _div.appendChild(_divtool);
            _div.setAttribute('style', 'display:flex;padding: 0;margin-bottom:5px;background: aliceblue;');
            target.appendChild(_div);
            target.classList.remove("AddStatus");
        }
        $("#myModal .close").click();
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
                        _frm = e.target.parentElement.parentElement.parentElement;
                        _sent_id = _exam.getElementsByTagName('ul')[0].getAttribute("sent_id");
                        if(_sent_id) {
                            // delete sentence
                            $.ajax({
                                url: delete_sentence,
                                headers:{ "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val()  },
                                data: {
                                    'sent_id':_sent_id
                                },
                                dataType: 'json',
                                success: function (data) {
                             
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
                cancel: { text:'No' },
            }
        });
    });
    $("#btn_vtype").on('click', function(){ 
        if ($('#part').css('display') =='none') {
            $('#part').css('display', 'flex');
            $('#btn_vtype').removeClass('sky_button');
            $('#btn_vtype').css('border-radius', '5px 5px 0 0');
            document.getElementById('btn_vtype').style.backgroundPosition = 'center bottom';
        } else {
            $('#part').css('display', 'none');
            $('#btn_vtype').addClass('sky_button')
            $('#btn_vtype').css('border-radius', '3px');
            document.getElementById('btn_vtype').style.backgroundPosition = 'center top';
        }
    });
    $(document).on('click', "#list_lexitron ul", function(e) {
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $("#id_Vocabulary").val(e.target.textContent);
        $("#user_vocabulary").text(e.target.attributes["user"].value);
        $.ajax({
            // type: "POST",
            url: query_WordContents,
            headers:{
                "X-CSRFToken": csrftoken
            },
            data: {
                'user' : e.target.attributes["user"].value,
                'seltext': e.target.textContent,
                'is_approved': 2
            },
            dataType: 'json',
            success: function (data) {

                var target = document.getElementById('db_vocabulary');
                target.innerHTML = "";

                if(Object.keys(data).length == 0) return;
                for (_d in data) {
                    var name = data[_d]["part"].split('.')[0];
                    var _div = document.createElement('div');
                    _div.id = "frm_" + name;
                    _div.setAttribute('word_id', data[_d]["word_id"]);
                    _div.setAttribute('class', 'frame');
                    var _label = document.createElement('label');
                    _label.textContent = name;
                    _label.setAttribute('class', 'frm_label');
                    _div.appendChild(_label);
                    var _btnRemove = document.createElement('button');
                    _btnRemove.setAttribute('class', 'close glyphicon glyphicon-remove');
                    _div.appendChild(_btnRemove);
                    
                    var labelTrans = document.createElement("label");
                    labelTrans.setAttribute('class', 'txtlabel');
                    labelTrans.textContent = "Translation:";
                    var inputTrans = document.createElement("textarea");
                    inputTrans.id = 'trans_' + name;
                    inputTrans.value = data[_d]['trans'];
                    _div.appendChild(labelTrans);
                    _div.appendChild(inputTrans);

                    var labelRelated = document.createElement("label");
                    labelRelated.setAttribute('class', 'txtlabel');
                    labelRelated.textContent = "Related:";
                    var inputRelated = document.createElement("textarea");
                    inputRelated.id = 'related_' + name;
                    inputRelated.value = data[_d]['related'];
                    _div.appendChild(labelRelated);
                    _div.appendChild(inputRelated);

                    var labelSynonym = document.createElement("label");
                    labelSynonym.setAttribute('class', 'txtlabel');
                    labelSynonym.textContent = "Synonym:";
                    var inputSynonym = document.createElement("textarea");
                    inputSynonym.id = 'synonym_' + name;
                    inputSynonym.value = data[_d]['synonym'];
                    _div.appendChild(labelSynonym);
                    _div.appendChild(inputSynonym);

                    var labelAntonym = document.createElement("label");
                    labelAntonym.setAttribute('class', 'txtlabel');
                    labelAntonym.textContent = "Antonym:";
                    var inputAntonym = document.createElement("textarea");
                    inputAntonym.id = 'antonym_' + name;
                    inputAntonym.value = data[_d]['antonym'];
                    _div.appendChild(labelAntonym);
                    _div.appendChild(inputAntonym);
                    
                    // if(Object.keys(data[_d]['sentences']).length) 
                    {
                        var labelExample = document.createElement("label");
                        labelExample.textContent = "Example Sentences:";
                        labelExample.setAttribute('class', 'txtlabel');
                        _div.appendChild(labelExample);
            
                        var btn_add = document.createElement("button");
                        btn_add.setAttribute('class', 'btn_add glyphicon glyphicon-plus');
                        btn_add.setAttribute('data-toggle',"modal");
                        btn_add.setAttribute('data-target', "#myModal");
                        _div.appendChild(btn_add);

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
                            _ul.setAttribute('sent_id', data[_d]['sentences'][_s]["sent_id"]);
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

    $('#list_lexitron').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            ShowVocabulary(1);
        }
    });
    $('#id_s_lang').on('change', function(e) {
        $(".btn_search").click();
    });

    $(".btn_new").on('click', function(){
        $("#db_vocabulary").html("");
        $("#user_vocabulary").text($("#U_name").val());
        $("#id_Vocabulary").val("");
    })
    $(".btn_save").on('click', function(){ 
        if(!$("#user_vocabulary").text()) {window.location.href = "/translator"; return;}
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

        var frames = $('#db_vocabulary .frame');
        var _data = [];
        var data_len = 0;
        for (_frm of frames) {
            var _name = _frm.id.split('_')[1];
            _data[data_len] = [];
            _data[data_len][0] = _frm.getAttribute('word_id');
            _data[data_len][1] = _name;
            if(_name == "other") {
                _data[data_len][1] = $(frm).children("#key_other").val().trim();
                if(_data[data_len][1] == "") { obj_focus($(frm).children("#key_other")); return;}
            }
            var _trans = $(_frm).children('#trans_' + _name).val();
            if(_trans == "") { obj_focus($(_frm).children('#trans_' + _name)); return; }
            _data[data_len][2] = _trans;
            _data[data_len][3] = $(_frm).children('#related_' + _name).val().trim();
            _data[data_len][4] = $(_frm).children('#synonym_' + _name).val().trim();
            _data[data_len][5] = $(_frm).children('#antonym_' + _name).val().trim();
            var _ex = $(_frm).find('ul');
            for( i=0; i<_ex.length;i++ ){
                _data[data_len][i+6] = []
                _data[data_len][i+6][0] = _ex[i].getAttribute('sent_id');
                _data[data_len][i+6][1] = _ex[i].children[0].textContent;
                _data[data_len][i+6][2] = _ex[i].children[1].textContent;
            }
            data_len++;
        }
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
            url: query_UserDictionaryList,
            data: {
                'seltext': $("#id_Vocabulary").val().trim(),
                's_lang' : $("#id_s_lang").val().toLowerCase().substr(0,2),
                't_lang' : $("#id_t_lang").val().toLowerCase().substr(0,2),
                'is_approved': 2
            },
            dataType: 'json',
            success: function (data) {
                if(Object.keys(data.content).length) {
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
                'user' : $("#user_vocabulary").text(),
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
                                window.location = "/user_words";
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
    ShowVocabulary(0);
    $(".btn_new").click();
})