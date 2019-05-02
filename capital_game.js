// Initialize Firebase
var config = {
  apiKey: "AIzaSyBmDjqnIJul8ao6DhgJW84WBlYmA-oiGc0",
  authDomain: "poject3-51c5a.firebaseapp.com",
  databaseURL: "https://poject3-51c5a.firebaseio.com",
  projectId: "poject3-51c5a",
  storageBucket: "poject3-51c5a.appspot.com",
  messagingSenderId: "705817049444"
};
firebase.initializeApp(config);
// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

var q_entry;
var question=document.getElementById("pr2__question");
var myTable= document.getElementById("mytable");
var inpBox=document.getElementById("pr2__answer");
var seeButton=document.getElementById('pr2__submit');
var filters=document.getElementsByName("filter");
var clearButton=document.getElementById('pr3__clear');
var undoButton=document.getElementById('pr3__undo');
var resetButton=document.getElementById('pr3__reset');


//get random integer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//get random entry
function getRandomEntry(){
  var index=getRandomInt(1,window.pairs.length);
  var newPair= window.pairs[index];
  window.pairs.splice(index,1);//avoid one question occurs more than one time
  return newPair;
}

//initialize Table
function initializeTable(){// initialize whole table
  /*
    Initialize the courses in the right plane
  */
  var numRows=myTable.rows.length;
  for(var i=0;i<numRows-4;i++){
    myTable.deleteRow(4);
  }
}



//filter correct entries and wrong entries
$("input[name='filter']").click(function(){
  var flen=myTable.rows.length;
  var tempRows=myTable.rows;
  if(filters[0].checked){

    for(var i=0;i<flen;i++){
      tempRows[i].style.display='';
    }
  }

  else if(filters[1].checked){

    for(i=0;i<flen;i++){
      var tempR=tempRows[i];
      if(tempR.id==="wrong"){
        tempR.style.display="none";
      }
      else{
        tempR.style.display='';
      }
    }
  }


  else if(filters[2].checked){

    for(i=0;i<flen;i++){
      tempR=tempRows[i];
      if(tempR.id==="right"){
        tempR.style.display="none";
      }
      else{
        tempR.style.display='';
      }
    }
  }

});

//向数据库里添加entry表项
function writeToDatabase(cpair,inp) {
  var newKey = firebase.database().ref('/entryBox/').push();
  newKey.set({
    pair:cpair,
    answer:inp
  });
}


function bindHover(id){
  var timer;
  $(id).on('mouseenter','td',function(){
     var hold=this.innerHTML;
     var countryTD=this.parentNode.firstChild; //get country as prefix, to ensure get location of a capital city, not a company
     if(hold.indexOf("<")!==-1){
       hold=hold.split("<")[0];
       timer=setTimeout(function(){
         $('#map').attr('src',
             'https://www.google.com/maps/embed/v1/place?&key=AIzaSyC-p4m93ucVeEEytDmFt-dVRrOZ7XPE-yY&language=en&maptype=roadmap&q='
         +countryTD.innerHTML+hold+"&zoom=5");
         $('#map').attr('style',"border:1px solid black");
       },1000);
     }
     else{
       timer=setTimeout(function(){
         dynamicQ("Country "+hold);
         $('#map').attr('style',"border:1px solid black");
       },1000);
     }

  });

  $(id).on('mouseout','td',function(){
    clearTimeout(timer);
    dynamicQ(question.innerHTML);
    $('#map').attr('style',"border:0");

  })

}





//add new content of one row in table 填充表格数据
function fillContent(entry,ifundo=false,input="",index=0){
  var inp_answer=inpBox.value;
  var row=document.createElement('tr');

  var countryName=document.createElement('td');
  countryName.innerHTML=entry.country;


  var capital=document.createElement('td');
  capital.innerHTML=inp_answer;


  var answer=document.createElement('td');
  console.log(inp_answer,entry.capital);
//---------------------------------------------------judge whether answer is correct -----------------------------------//
  if(inp_answer.toLowerCase()===entry.capital.toLowerCase()){//correct case
    row.style="color: green";
    row.id="right";
    capital.innerHTML=entry.capital;
    answer.innerHTML=entry.capital;
    if(filters[2].checked){
      filters[0].checked="checked";
      var flen=myTable.rows.length;
      var Rows=myTable.rows;
      for(var i=0;i<flen;i++){
        var tempR=Rows[i];
        tempR.style.display="";
      }

    }
  }
  else{//wrong case
    row.id="wrong";
    row.style="color: red";
    capital.style="text-decoration-line: line-through";
    capital.innerHTML=inp_answer;
    answer.innerHTML=entry.capital;
    if(filters[1].checked){
      filters[0].checked="checked";
      flen=myTable.rows.length;
      Rows=myTable.rows;
      for(i=0;i<flen;i++){
        tempR=Rows[i];
        tempR.style.display="";
      }
    }
  }
  //-------------------------------------------------------------------------------------------------------------//
  if(ifundo){
    inp_answer=input;
  }

  //----------------------------------------------append child and insert row-----------------------------//
  var btnDel = document.createElement('input'); //创建一个input控件

  btnDel.setAttribute('type','button'); //type="button"
  btnDel.setAttribute('value','Delete');

  answer.appendChild(btnDel);
  row.appendChild(countryName);
  row.appendChild(capital);
  row.appendChild(answer);
  writeToDatabase(q_entry,inp_answer);
  btnDel.onclick=function(){

        var text=this.parentNode.innerHTML;
        var line=this.parentNode.parentNode;//for line index
        record_log_database('delete',entry,inp_answer,line.index);
        this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
        firebase.database().ref('/entryBox/').once('value', function(snapshot) {
            var myValue = snapshot.val();
            var keyList = Object.keys(myValue);
            for(var i=0;i<keyList.length;i++) {
                var myKey = keyList[i];
                var reference=myValue[myKey].pair;
                var cap=reference.capital;
                if(text.indexOf(cap)===0){
                    firebase.database().ref('/entryBox/').child(myKey).remove();
                }

            }
        });
    };
  if(index===0){$(row).insertAfter("#insertID");}
  else {
    $(row).insertAfter(myTable[index-1]);
  }
  if(!ifundo){
    record_log_database("add",entry,inp_answer,myTable.rows.length-1);
  }
  bindHover("#wrong");
  bindHover("#right");

}

//页面再次载入时重新填充表格数据
function ReAddrow(entry,inp){
  var inp_answer=inp;
  var row=document.createElement('tr');
//add country name
  var countryName=document.createElement('td');
  countryName.innerHTML=entry.country;

//add capitial
  var capital=document.createElement('td');
  capital.innerHTML=inp_answer;

//add answer
  var answer=document.createElement('td');
  if(inp_answer.toLowerCase()===entry.capital.toLowerCase()){//correct case
    row.style="color: green";
    row.id="right";
    capital.innerHTML=entry.capital;
    answer.innerHTML=entry.capital;
    if(filters[2].checked){
      filters[0].checked="checked";
      var flen=myTable.rows.length;
      var Rows=myTable.rows;
      for(var i=0;i<flen;i++){
        var tempR=Rows[i];
        tempR.style.display="";
      }

    }
  }
  else{//wrong case
    row.id="wrong";
    row.style="color: red";
    capital.style="text-decoration-line: line-through";
    capital.innerHTML=inp_answer;
    answer.innerHTML=entry.capital;
    if(filters[1].checked){
      filters[0].checked="checked";
      flen=myTable.rows.length;
      Rows=myTable.rows;
      for(i=0;i<flen;i++){
        tempR=Rows[i];
        tempR.style.display="";
      }
    }
  }
  var btnDel = document.createElement('input'); //创建一个input控件
  btnDel.setAttribute('type','button'); //type="button"
  btnDel.setAttribute('value','Delete');
  answer.appendChild(btnDel);
  row.appendChild(countryName);
  row.appendChild(capital);
  row.appendChild(answer);
  btnDel.onclick=function(){

        var text=this.parentNode.innerHTML;
        var line=this.parentNode.parentNode;//for line index
        record_log_database('delete',entry,inp_answer,line.index);
        this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
        firebase.database().ref('/entryBox/').once('value', function(snapshot) {
            var myValue = snapshot.val();
            var keyList = Object.keys(myValue);
            for(var i=0;i<keyList.length;i++) {
                var myKey = keyList[i];
                var reference=myValue[myKey].pair;
                var cap=reference.capital;
                if(text.indexOf(cap)===0){
                    firebase.database().ref('/entryBox/').child(myKey).remove();
                }

            }
        });
    };
  $(row).insertAfter("#insertID");
}

function whether_disable_refresh(){
  $('#pr3__undo').attr("disabled",true);
  return firebase.database().ref('/undoBox/').once('value', function(snapshot){
    var myValue = snapshot.val();
    if(myValue!==null){
      var keyList = Object.keys(myValue);
      if(keyList.length!==0){
        $('#pr3__undo').attr("disabled",false);
      }
    }
  })
}
//从firebase读取数据
function readFromDatabase() {
  $('#pr3__clear').attr("disabled",true);
  whether_disable_refresh();
  return firebase.database().ref('/entryBox/').once('value', function(snapshot) {
    initializeTable();
    var myValue = snapshot.val();
    if(myValue!==null){
      var keyList = Object.keys(myValue);
      if(keyList.length!==0){
        $('#pr3__clear').attr("disabled",false);
      }
      for(var i=0;i<keyList.length;i++) {
        var myKey = keyList[i];
        ReAddrow(myValue[myKey].pair,myValue[myKey].answer);

        bindHover("#wrong");
        bindHover("#right");

      }
    }
  });
}

//文档加载完毕即开始
$( document ).ready(function() {
  //ajax part
  $.ajax({method:"GET",url:"https://s3.ap-northeast-2.amazonaws.com/ec2-54-144-69-91.compute-1.amazonaws.com/country_capital_pairs_2019.csv",
    async:false,dataType:"text", //fetch csv file from the link above,and then transform it to pairs
    success:function(pdata){
      var textLines=pdata.split(/\r\n|\r/);
      var eachP=[];
      var temp;
      for(var i=0;i<textLines.length;i++){
        temp=textLines[i].split(",");
        eachP.push({"country":temp[0],"capital":temp[1]});
      }
      window.pairs=eachP;
    }});
  //----------------------------------ajax part -----------------------//

  readFromDatabase();
  q_entry=getRandomEntry();
  question.innerHTML=q_entry.country;
  dynamicQ("Country "+q_entry.country);
  inpBox.focus();
});

// When see answer is clicked, it will clean input box and set a new random entry
// And add a row of record entry below #insertID row, change src of iframe
seeButton.onclick=function(){

  fillContent(q_entry);
  q_entry=getRandomEntry();
  question.innerHTML=q_entry.country;
  dynamicQ(q_entry.country);
  inpBox.value='';
  $('#pr3__undo').attr("disabled",false);
  $('#pr3__clear').attr("disabled",false);
};


//dynamically set src of iframe which contains src
function dynamicQ(qountry){
  $('#map').attr('src', "https://www.google.com/maps/embed/v1/place?&key=AIzaSyC-p4m93ucVeEEytDmFt-dVRrOZ7XPE-yY&language=en&maptype=roadmap&q="
  +qountry);
}




//autocomplete插件的函数定义
$( function(){

  var accentMap = {
    "á": "a",
    "ö": "o"
  };
  var normalize = function( term ) {
    var ret = "";
    for ( var i = 0; i < term.length; i++ ) {
      ret += accentMap[ term.charAt(i) ] || term.charAt(i);
    }
    return ret;
  };
  var capitals=[];
  for(var i=0;i<window.pairs.length;i++){
    capitals.push(window.pairs[i].capital);
  }
  $("#pr2__answer").autocomplete({
    source: function( request, response ) {
      var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
      response( $.grep( capitals, function( value ) {
        value = value.label || value.value || value;
        return matcher.test( value ) || matcher.test( normalize( value ) );
      }) );
    },
    focus: function (event, ui) {
      $(this).val(ui.item.label);
      return false;
    },
    select: function (event, ui){
      $(this).val(ui.item.label);
      ui.item.value = "";
      seeButton.onclick();
    }
  });

});


//for backup current table before click on clear
function fetchData_Table(){
  var pairs=[];
  var country;
  var capital;
  var input;
  var cuurentTable=document.getElementById('mytable').rows;
  for(var i=4;i<cuurentTable.length;i++){
    for(var j=0;j<cuurentTable[i].cells.length;j++){
      switch(j){
        case 0: country=cuurentTable[i].cells[j].innerHTML;break;
        case 1: input=cuurentTable[i].cells[j].innerHTML;break;
        case 2: capital=cuurentTable[i].cells[j].innerHTML.split("<")[0];break;
      }
    }
    pairs.push({"pair":{"country":country,"capital":capital},"input":input});
  }
  return pairs;
}

//clear all content
clearButton.onclick=function(){
  var pairs=fetchData_Table();
  initializeTable();
  record_log_database("clear",{},"",0,pairs);// how to record data in database? how to recover database
  firebase.database().ref('/entryBox').remove();
};

//record every operation and current data into database
function record_log_database(op,pair,input="",index=0,pairs=[]) {
  var newKey = firebase.database().ref('/undoBox/').push();
  newKey.set({
    operation:op,
    pair:pair,
    input:input,
    index:index,
    pairs:pairs
  });
}

//for add case to delete row and delete log of database
function deleteaddkeys(){
  return firebase.database().ref('/entryBox/').once('value',function(snapshot){
    var myValue=snapshot.val();
    if(myValue!==null){
      var keyList=Object.keys(myValue);
      var myKey= keyList.pop();
      firebase.database().ref('/entryBox/').child(myKey).remove();
    }
  })
}

//when undo button onclick, regain last step's content
undoButton.onclick=function(){
  var op;
  var entry;
  var pairs;
  var input;
  var index;
  return firebase.database().ref('/undoBox/').once('value',function(snapshot){
    var myValue=snapshot.val();
    if(myValue!==null){

      var keyList = Object.keys(myValue);
      var myKey = keyList.pop();
      op=myValue[myKey].operation;
      entry=myValue[myKey].pair;
      input=myValue[myKey].input;
      index=myValue[myKey].index;

      if(op==="add"){
        myTable.deleteRow(index);
        deleteaddkeys();
        firebase.database().ref('/undoBox/').child(myKey).remove();
      }

      else if(op==="delete"){
        index=myValue[myKey].index;
        fillContent(entry,true,input,index);
        firebase.database().ref('/undoBox/').child(myKey).remove();
      }

      else if(op==="clear"){
        pairs=myValue[myKey].pairs;
        for(var i=0;i<pairs.length;i++){
          writeToDatabase(pairs[i].pair,pairs[i].input);
          ReAddrow(pairs[i].pair,pairs[i].input);
        }
        firebase.database().ref('/undoBox/').child(myKey).remove();
      }
      if(document.getElementById('mytable').rows.length===4){
        $(undoButton).attr("disabled",true)
      }






    }
  })
};


resetButton.onclick=function(){
  $('#pr3__undo').attr('disabled',true);
  initializeTable();
  firebase.database().ref('/entryBox').remove();
  firebase.database().ref('/undoBox').remove();
};