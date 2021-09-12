"use strict";

//the pc opperation, should be done via a function
//as this will also allow UI updating
//the run button neads to be diabled once clicked
//a stop button needs to be included.

class LMC {
  constructor(code,debug,timeInt,idNumber) {
      this.reset(code,debug,timeInt,idNumber);
      this.load(this.code);
          
    };
  
  //the input and output are overideable
  setOutput(output){
    this.output = document.getElementById(output);
  }
  setInput(inp){
    this.input = document.getElementById(inp);
  }

  reset(code,debug,timeInt,idNumber){
    this.pc = 0;
    this.mailboxes = [];
    this.inbox = 0;
    this.outbox =0;
    this.accumulator = 0;
    this.carryFlag = 0;
    this.negativeFlag = false;
    this.code = code;
    this.resetFlag = true;
    this.running = false;
    this.debug = debug;
    this.timeInt = timeInt;
    this.id = idNumber;
    this.log=[];
    this.idel = 100;
    this.idelA = []; //array to hold average idelness 0- 9
    for (var a = 0; a<10;a++){
      this.idelA.push(100);
    }

    //run settings
    this.loop=0;
    this.inst = this.mailboxes[this.pc];
    this.op = 0;
    this.timeID=0;
    
    //get the input and output boxes
    this.output = document.getElementById("output"+this.id);
    this.input = document.getElementById("input"+this.id);
    this.outPC = document.getElementById("pc"+this.id);
    this.outPC.innerHTML = "PC: "  + this.pc;
    this.outACC = document.getElementById("acc"+this.id);
    this.outACC.innerHTML = "ACC: "  + this.accumulator;
    this.cir = document.getElementById("cir"+this.id);
    //initilise mailboxes
    for (let m=0;m<99;m++){
      this.mailboxes[m]=0;
    }


  
    
  }

  //load the code into the mailboxes
  load(code){
    console.log("LOADING CODE TO RAM");
    for(let l=0; l<this.code.length;l++){
      this.mailboxes[l]=this.code[l];
    }
  };



  eMessage(message){
    if(this.debug){
    console.log(message);
    } else {
      this.log.push(message);
    }
  }

  printLog(){
    console.table(this.log);
  }

  pcInc(){
    this.pc+=1;
    this.outPC.innerHTML = "PC: "  + this.pc;
  }

  //tick(self){
  tick(){
   var self = this;
  
      self.loop+=1;

      //this could be a safe mode
      if(self.loop>1000){
        self.running=false;
        console.log("Loop = 1000, Exiting");
      }

      self.inst =self.mailboxes[self.pc];
      self.op = Math.floor(self.inst/100);
      //console.log("OPcode: " +op);
      if(self.accumulator<0){
         self.negativeFlag=true;
       }else{
         self.negativeFlag=false;
       }
      
       self.cir.innerHTML = "CIR: "  + self.op;

      switch (self.op) {
    //check op codes and perform processes
    case (1):  //ADD
      self.accumulator += self.mailboxes[self.inst % 100];
      self.outACC.innerHTML = "ACC: "  + self.accumulator;
      self.pcInc(self);
      self.eMessage("Adding mailbox (" + inst % 100 +") to  accumulator" );
      break;

    case (2): //SUBTRACT
      self.accumulator -= self.mailboxes[self.inst % 100];
      if(self.accumulator<0){ self.negativeFlag=true;}
      
      self.outACC.innerHTML = "ACC: "  + self.accumulator;
      self.pcInc(self);
      self.eMessage("Subtracting mailbox (" + self.inst % 100 +") from accumulator" );
      break;

      case (3): //STORE
        self.mailboxes[self.inst % 100]=self.accumulator;
        self.pc+=1;
        self.outPC.innerHTML = "PC: "  + self.pc;
        self.eMessage("Storing " + self.accumulator + " in mailbox: " + self.inst % 100);
        break;
        case (5): //LOAD
          self.accumulator=self.mailboxes[self.inst % 100];
          self.pc+=1;
          self.outACC.innerHTML = "ACC: "  + self.accumulator;
          self.outPC.innerHTML = "PC: "  + self.pc;
        self.eMessage("Loading mailbox (" + self.inst % 100 +") into  accumulator" );
          break;
          case (6): //BRANCH

            self.pc =self.inst%100;
            self.outPC.innerHTML = "PC: "  + self.pc;
            self.eMessage("Setting PC to: " + self.pc );
            break;
            case (7): //BRANCH IF ZERO
            if(self.accumulator===0){
              self.pc =self.inst%100;
              self.outPC.innerHTML = "PC: "  + self.pc;
              self.eMessage("ACC = 0 , setting PC to: " + self.pc);
            } else {
            self.eMessage("ACC = " + self.accumulator + ", not branching");
            self.pc+=1;
            }
              break;

              case (8): //BRANCH IF POSITIVE
              //self needs to be changed to:
              //if(!self.negativeFlag){}
              if(self.accumulator>=0){
                self.pc = self.mailboxes[self.inst % 100];
                self.outPC.innerHTML = "PC: "  + self.pc;
                eMessage("ACC >= 0 , setting PC to: " + self.pc);
              } else {
              eMessage("ACC Negative: not branching");
              self.pc+=1;
            }
                break;
                case (9): //IO
                  if (self.inst===901){  //INPUT

                    if(self.input.value === ""){
                      console.log("Null input");
                      self.pc-=1;
                      self.outPC.innerHTML = "PC: "  + self.pc;
                    }

                    var val = Number(self.input.value);
                    self.accumulator =   val;
                    self.outACC.innerHTML = "ACC: "  + self.accumulator;
                    //eMessage("INPUT: 3");
                  }
                  if (self.inst===902){ //OUTPUT
                    console.log("OUTPUT: " + self.accumulator);
                    //console.log(self.output);
                    self.output.value = self.accumulator;

                  }
                  self.pc+=1;
                  self.outPC.innerHTML = "PC: "  + self.pc;
                  break;
                  case (0):  //HALT
                    //self.running = false;
                   // self.pc+=1;
                  self.outPC.innerHTML = "PC: "  + self.pc;
                    console.log("HALTING ---- going for coffee" );
                    clearInterval(self.timeID);
                    //return;
                    break;


          //notes
          /*
            would be good to make the accumulator a sseprate thing
            so that the flag can be set properly.

          */

  }

  }



  run(){
    console.log("STARTING -------");
    this.loop = 0;
    this.inst =this.mailboxes[this.pc];
    this.op = 0;
    //console.log("Accumulator: " + this.accumulator);
    this.running = true; //touchStarted()

   //while (this.running) {
      var self = this;

     // setTimeout(this.tick(),500) 
     this.timeID=setInterval( () => this.tick(), this.timeInt);
     //setInterval( this.baz.bind(this), 1000 );
     // this.timeID = setInterval(this.tick,this.timeInt,self) ;
      console.log("end");
   // }
//console.log("Accumulator: " + this.accumulator);

  }

  halt(){

  }





}



const opcodes = {
  'HLT': 0, //HALT
  'COB': 0, //Coffee Break (STOP)
  'DAT': 0, // DATA (complier instrucion)
  'ADD': 100, //Add mailbox value to accumulator
  'SUB': 200, //Subtract a mailbox value from accumulator
  'STA': 300,
  'LDA': 500,
  'BRA': 600,
  'BRZ': 700,
  'BRP': 800,
  'INP': 901,
  'OUT': 902,
};

//function debug(message){
  //this need sorting for the cpu
  //better to move this to the cpu itself
 // if (lmc1.debug){
  //console.log(message);
//}
//}

function assemeble(code, debug) {
  console.log("ASSEMBLING ----- \n");
  
  if (code === "") throw new Error('Compiler cannot use this code');
  code = code.toUpperCase();
  //code = code.replace(/^\s+|\s+$/gm,'');
  code = code.trim();
  let lines = code.split('\n'); //split into space seperated tokens
  
  //strip out any lines with just space or newlines
  for (l = 0; l<lines.length;l++){
    
    if (lines[lines.length-l]===""){
      if (debug){console.log("Removing Line: " + (lines.length-l));}
      lines.splice(lines.length-l,1);
    }
   
  }
  //it would be nice to add the cleaned up text back into the text box.


  console.log(lines);

  let labels = {}; //store all the address labels
  let result = [];
//read tall the tokens
for (l = 0; l < lines.length; l++) {
    //read 1 line at a time and trim off any whitespace
    let line = lines[l].trim();
    //use a regex to split insto secones seperated by spaces
    let parts = line.split(/\s+/);

    //check if the first token is a label
    let first = parts[0];
    //it is not a number and it is not a recognised command
    if (isNaN(first) && opcodes[first] === undefined) {
        //it must be a label
        let label = parts.shift(); //shift array, return first part and resize.
        labels[label] = l; //set the label to the line it was declared
    };


    lines[l] = parts;
  
    
  }
//assembele into machine code
for (var l = 0; l < lines.length; l++) {
  let parts = lines[l]; //grab a line
  let token = parts[0]; //get first command of line
  let value = 0;
    if (!isNaN(parseInt(token))) { //if is a number
    value = parseInt(token);
  } else {
    //if its not a number
    value = opcodes[token];  //is it an opcode

    if (value === undefined) {
      throw new Error('Command not found: ' + token);
    }

    let address = parts[1];
    if (address !== undefined && !address.startsWith('//')) {
      //there must be a location
      let parsed = parseInt(address);
      let convertedLabel = labels[address];
      if (isNaN(parsed) && convertedLabel === undefined) {
        throw new Error('Address or Lable not found: ' + address);
      }
      if (convertedLabel !== undefined) {
        value += convertedLabel;
      } else {
        value += parsed;
      }
    }

  }
  //add the result to the array
  result.push(value)
}

//console.log(result);
return result;

};
