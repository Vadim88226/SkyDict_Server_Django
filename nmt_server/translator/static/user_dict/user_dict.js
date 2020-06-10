var s_text = "", similar_text = "";
var flag_vocabulary_load = false
var end_vocabulary = 0;

function ShowVocabulary(_mode)
{
    _is_approved = document.querySelector('input[name="allowed"]:checked').value;
    if(!_mode) {
        end_vocabulary = 0;
        flag_vocabulary_load = false;
    }
    if(flag_vocabulary_load) return;
    var selectedText = $('#id_searchWord').val().trim();
    $.ajax({
        url: query_UserDictionaryList,
        data: {
            'seltext': selectedText,
            's_lang' : $("#id_s_lang").val().toLowerCase().substr(0,2),
            't_lang' : $("#id_t_lang").val().toLowerCase().substr(0,2),
            'is_approved': _is_approved,
            'end_id': end_vocabulary
        },
        dataType: 'json',
        success: function (response) {
            if (response != "") {
                if(response.content.length == 0) {
                    document.getElementById("list_vocabulary").innerHTML="";
                    return;
                } else {
                    if(!_mode) document.getElementById("list_vocabulary").innerHTML="";
                    data = response.content;
                    for( _d in data ) {
                        end_vocabulary = data[_d]['mid'];
                        _ul = document.createElement("ul");
                        _ul.textContent = data[_d]["word"];
                        _ul.setAttribute('user', data[_d]['user']);
                        document.getElementById("list_vocabulary").appendChild(_ul);
                    }
                    if(data.length < 50) flag_vocabulary_load = true;
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
    })
    $('input[type=radio][name=allowed]').change(function() {
        switch (document.querySelector('input[name="allowed"]:checked').value) {
            case '0':
                $('.div_unapproved').css('border-style', 'solid solid none solid');
                $('.div_approved').css('border-style', 'none none solid none');
                $(".btn_approve").css('visibility', 'visible');
                $("#list_vocabulary").css("display", "block");
                break;
            case '1':
                $('.div_unapproved').css('border-style', 'none none solid none');
                $('.div_approved').css('border-style', 'solid solid none solid');
                $(".btn_approve").css('visibility', 'hidden');
                $("#list_vocabulary").css("display", "block");
                break;
        }
        $(".btn_search").click();
    });
    $(document).on('click', "#list_vocabulary ul", function(e) {
        var csrftoken = $("[name=csrfmiddlewaretoken]").val();
        $.ajax({
            // type: "POST",
            url: query_WordContents,
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
                if(Object.keys(data).length == 0) return;
                $('#view_content').css('display', 'block');
                document.getElementById("view_word").textContent = e.target.textContent;
                document.getElementById("view_word").setAttribute('user', data[0]["user"]);
                
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
                    
                    if(Object.keys(data[_d]['sentences']).length) {
                        var labelExample = document.createElement("label");
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
        $("#modal .close").click();
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
                                $(".btn_search").click();
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
                                                $(".btn_search").click();
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
    ShowVocabulary(0);
    $('#list_vocabulary').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            ShowVocabulary(1);
        }
    });
    $('#id_s_lang').on('change', function(e) {
        $(".btn_search").click();
    });
})