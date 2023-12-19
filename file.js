var words = [
    {number:1,direction:'across',row:1,column:3,clue:'The fusion of Pro and Art, created by creators',answer:'studiobook'},
    {number:2,direction:'across',row:2,column:4,clue:'The colorful, bold and youthful series.',answer:'vivobook'},
    {number:3,direction:'across',row:3,column:3,clue:'Premium,thin and light',answer:'zenbook'},
    {number:4,direction:'across',row:4,column:3,clue:'Ultimate performance for creators',answer:'proart'},
    {number:5,direction:'across',row:5,column:5,clue:'The best take-anywhere laptops',answer:'expertbook'}
  ];
  
  // Set global variables
  var gridSize = [14,5];     // number of squares wide, number of squares tall
  var direction = 'across';   // set initial direction to 'across'
  var markCorrect = true;     // indicates ability for answers to be marked correct. will be set to false if "show answers" is clicked
  var successShown = false;   // indicates whether the success modal has been shown
  var $clueTooltip = $('<div class="clue-tooltip invisible"><div class="clue-tooltip-arrow"></div><div class="clue-tooltip-text"></div></div>').appendTo('.crossword');
  

  
  // set up the base grid
  var $crosswordPuzzle = $('<div class="mt-4 crossword-puzzle col-md-8 col-lg-10 d-flex justify-content-center align-items-center"></div>');
  var $table = $('<table class="crossword-grid"></table>');
  for ( i=0; i<gridSize[1]; i++) {
      var $row = $('<tr class="grid-row"></tr>');
      for (j=0;j<gridSize[0];j++) {
          $square = $('<td class="grid-square"></td>');
          $square.appendTo($row);
      }
      $row.appendTo($table);
      $table.appendTo($crosswordPuzzle);
      $crosswordPuzzle.appendTo('.crossword');
  }
  
  // Add the fields to the grid
  for (i=0;i<words.length;i++) {
      var row = words[i].row;
      var column = words[i].column;
      for (j=0;j<words[i].answer.length;j++) {
          var $square = $('.grid-row').eq(row-1).find('.grid-square').eq(column-1);
          var title = words[i].clue+', letter '+(j+1)+' of '+words[i].answer.length;
          var id = (words[i].direction == 'across' ? 'a' : 'd') + '-' + words[i].number + '-' + (j+1);
          if (j==0 && $square.find('.word-label').length == 0) {
              $('<span class="word-label">'+words[i].number+'</span>').appendTo($square);
          }
          if ($square.find('input').length == 0) {
              var $input = $('<input type="text" class="letter" title="'+title+'" id="'+id+'" maxlength="1" />');
                  if (words[i].direction == 'across') {
                      $input.attr('data-across',words[i].number);
                      $input.attr('data-across-clue',words[i].clue);
                  } else {
                      $input.attr('data-down',words[i].number);
                      $input.attr('data-down-clue',words[i].clue);
                  }
                  $input.data('letter',words[i].answer[j]);
                  $input.appendTo($square);
              $square.addClass('active');
          } else {
              var $input = $square.find('input');
                  $input.attr('title',$input.attr('title')+'; '+title);
                  $input.attr('id',$input.attr('id')+'+'+id);
                  if (words[i].direction == 'across') {
                      $input.attr('data-across',words[i].number);
                      $input.attr('data-across-clue',words[i].clue);
                  } else {
                      $input.attr('data-down',words[i].number);
                      $input.attr('data-down-clue',words[i].clue);
                  }
          }
          if (words[i].direction == 'down') {
              row++;
          } else {
              column++;
          }
      }
  }
  
  
  
  // Add the success modal
  var $modal = $('<div class="modal fade" id="success-modal" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">Congratulations!</h4></div><div class="modal-body"><p>You have finished the puzzle.</p></div></div></div></div>');
  $modal.appendTo('body');
  
  // When a square is focused, highlight the other squares in that word and the clue, and show the tooltip
  $('input.letter').on('focus',function(){
      var $current = $(this);
      $current.select();
      $current[0].setSelectionRange(0, 10);
      getDirection($current);
      $('[data-'+direction+'='+$current.data(direction)+']').parent('.grid-square').addClass('current-word');
      $('.crossword-clues li').removeClass('active');
      $('.crossword-clues li[data-direction='+direction+'][data-clue='+$(this).data(direction)+']').addClass('active');
      $clueTooltip.css({'left':tooltipPosition($current).left+'px','top':tooltipPosition($current).top-10+'px'}).removeClass('invisible').find('.clue-tooltip-arrow').css('left',tooltipPosition($current).offset+'px');
  })
  
  // When a square is blurred, remove highlight from squares and clue
  $('input.letter').on('blur',function(){
      $('.grid-square').removeClass('current-word');
      $('.crossword-clues li').removeClass('active');
      $clueTooltip.addClass('invisible');
  })
  
  // handle directional and letter keys in letter inputs
  $('input.letter').on('keyup',function(e){
      var $current = $(this);
      if (e.which == 38) {      // up arrow moves to square above if it exists
          direction = 'down';
          if (getPrevLetter($current)) {
              getPrevLetter($current).focus();
          }
      } else if (e.which == 40) {      // down arrow moves to square below if it exists
          direction = 'down';
          if (getNextLetter($current)) {
              getNextLetter($current).focus();
          }
      } else if (e.which == 37) {      // left arrow moves to square to the left if it exists
          direction = 'across';
          if (getPrevLetter($current)) {
              getPrevLetter($current).focus();
          }
      } else if (e.which == 39) {      // right arrow moves to square to the right if it exists
          direction = 'across';
          if (getNextLetter($current)) {
              getNextLetter($current).focus();
          }
      } else {
          e.preventDefault();
      }
      if (markCorrect) {
          checkWord($current);
      };
  })
  
  // Tab and Shift/Tab move to next and previous words
  $('input.letter').on('keydown',function(e){
      var $current = $(this);
      if (e.which == 9) {       // tab
          e.preventDefault();
          if (e.shiftKey) {       // shift/tab
              getPrevWord($current).focus();
          } else {
              getNextWord($current).focus();
          }
      } else if (e.which == 8) {        // backspace
          e.preventDefault();
          if ($(this).val().length > 0) {
              $(this).val('');
          } else {
              if (getPrevLetter($current)) {
                  getPrevLetter($current).focus().val('');
              }
          }
      } else if ((e.which>=48 && e.which<=90) || (e.which>=96 && e.which<=111) || (e.which>=186 && e.which<=192) || (e.which>=219 && e.which<=222)) {    // typeable characters move to the next square in the word if it exists
          e.preventDefault();
          $current.val(String.fromCharCode(e.which));
          if (getNextLetter($current)) {
              getNextLetter($current).focus();
          }
      }
      if (markCorrect) {
          checkWord($current);
      };
  })
  
  // Check if all letters in selected word are correct
  function checkWord($current) {
      var correct;
      var currentWord;
      if ( $current.is('[data-across]') ) {
          correct = 0;
          currentWord = $current.data('across');
          $('[data-across='+currentWord+']').each(function(){
              if ($(this).val().toLowerCase() == $(this).data('letter').toLowerCase()) {
                  correct += 1;
              }
          })
          if (correct == $('[data-across='+currentWord+']').length ) {
              $('[data-across='+currentWord+']').parent('.grid-square').addClass('correct-across');
              $('.crossword-clues li[data-direction=across][data-clue='+currentWord+']').addClass('correct');
          } else {
              $('[data-across='+currentWord+']').parent('.grid-square').removeClass('correct-across');
              $('.crossword-clues li[data-direction=across][data-clue='+currentWord+']').removeClass('correct');
          }
      }
      
      if ($('.grid-square.active:not([class*=correct])').length == 0 && !successShown) {
          $('#success-modal').modal();
          successShown = true;
      }
  }
  
  // Return the input of the first letter of the next word in the clues list
  function getNextWord($current) {
      var length = $('.crossword-clues li').length;
      var index = $('.crossword-clues li').index($('.crossword-clues li.active'));
      var nextWord;
      if (index < length-1) {
          $nextWord = $('.crossword-clues li').eq(index+1);
      } else {
          $nextWord = $('.crossword-clues li').eq(0);
      }
      direction = $nextWord.data('direction');
      return $('[data-'+$nextWord.data('direction')+'='+$nextWord.data('clue')+']').eq(0);
  }
  
  // Return the input of the first letter of the previous word in the clues list
  function getPrevWord($current) {
      var length = $('.crossword-clues li').length;
      var index = $('.crossword-clues li').index($('.crossword-clues li.active'));
      var prevWord;
      if (index > 0) {
          $prevWord = $('.crossword-clues li').eq(index-1);
      } else {
          $prevWord = $('.crossword-clues li').eq(length-1);
      }
      direction = $prevWord.data('direction');
      return $('[data-'+$prevWord.data('direction')+'='+$prevWord.data('clue')+']').eq(0);
  }
  
  // If there is a letter square before or after the current letter in the current direction, keep global direction the same, otherwise switch global direction
  function getDirection($current) {
      if (getPrevLetter($current) || getNextLetter($current)) {
          direction = direction;
      } else {
          direction = (direction == 'across') ? 'down' : 'across';
      }
  }
  
  // Return the input of the previous letter in the current word if it exists, otherwise return false
  function getPrevLetter($current) {
      var index = $('[data-'+direction+'='+$current.data(direction)+']').index($current);
      if (index > 0) {
         return $('[data-'+direction+'='+$current.data(direction)+']').eq(index-1);
      } else {
         return false;
      }
  }
  
  // Return the input of the next letter in the current word if it exists, otherwise return false
  function getNextLetter($current) {
      var length = $('[data-'+direction+'='+$current.data(direction)+']').length;
      var index = $('[data-'+direction+'='+$current.data(direction)+']').index($current);
      if (index < length-1) {
         return $('[data-'+direction+'='+$current.data(direction)+']').eq(index+1);
      } else {
         return false;
      }
  }
  
  // Return the top, left, and offset positions for tooltip placement
  function tooltipPosition($current) {
      var left = $('[data-'+direction+'='+$current.data(direction)+']').eq(0).offset().left - $('.crossword').offset().left;
      var top = $('[data-'+direction+'='+$current.data(direction)+']').eq(0).offset().top - $('.crossword').offset().top;
      $clueTooltip.find('.clue-tooltip-text').text($current.data(direction+'-clue'));
      var right = left + $clueTooltip.outerWidth();
      var offset = right - $('.crossword-puzzle').outerWidth();
          offset = offset > 0 ? offset : 0;
      left = left - offset;
      return {'left':left,'top':top,'offset':offset};
  }

  // Check if all words are correct
// Check if all words are correct
function checkAllWords() {
    var $allWords = $('.crossword-clues li[data-direction]');
    var correctWords = 0;
    
    $allWords.each(function() {
      var $word = $(this);
      var direction = $word.data('direction');
      var currentWord = $word.data('clue');
      var $wordInputs = $('[data-' + direction + '="' + currentWord + '"]');
      var isWordCorrect = true;
  
      $wordInputs.each(function() {
        var $input = $(this);
        if ($input.val().toLowerCase() !== $input.data('letter').toLowerCase()) {
          isWordCorrect = false;
          return false; // Exit the loop if a letter is incorrect
        }
      });
  
      if (isWordCorrect) {
        correctWords++;
        $word.addClass('correct');
      } else {
        $word.removeClass('correct');
      }
    });
  
    return correctWords === $allWords.length;
  }
  
  // Updated checkWord function
  function checkWord($current) {
    var correct;
    var currentWord;
  
    if ($current.is('[data-across]')) {
      correct = 0;
      currentWord = $current.data('across');
      $('[data-across=' + currentWord + ']').each(function() {
        if ($(this).val().toLowerCase() == $(this).data('letter').toLowerCase()) {
          correct += 1;
        }
      });
  
      if (correct == $('[data-across=' + currentWord + ']').length) {
        $('[data-across=' + currentWord + ']').parent('.grid-square').addClass('correct-across');
        $('.crossword-clues li[data-direction=across][data-clue=' + currentWord + ']').addClass('correct');
      } else {
        $('[data-across=' + currentWord + ']').parent('.grid-square').removeClass('correct-across');
        $('.crossword-clues li[data-direction=across][data-clue=' + currentWord + ']').removeClass('correct');
      }
    }
  
    var allWordsCorrect = checkAllWords();
  
    if (allWordsCorrect && !successShown) {
      // Display congratulations message and animation
      $('#success-modal').modal();
      successShown = true;
      
      // Add animation class to elements
      $('.crossword').addClass('animated');
      $('.crossword-clues').addClass('animated');
    } else {
      // Remove animation class from elements
      $('.crossword').removeClass('animated');
      $('.crossword-clues').removeClass('animated');
    }
  }
  
  
 