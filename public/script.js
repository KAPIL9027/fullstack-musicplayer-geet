let player = new Audio();

const plays = document.querySelectorAll('.fas');

const makeAllPlays = (plays,player) =>
{
    player.pause();
    
    Array.from(plays).forEach((el)=>{
            el.classList.remove('fa-pause');
            el.classList.add('fa-play');
        });
}




for (let play of plays)
{
    
    play.addEventListener('click',(e)=>
    { 

        console.log('clicked');

        
        
        if (play.classList.contains('fa-play'))
        {
          makeAllPlays(plays,player);
          player = new Audio(`/${play.id}.mp3`);
          player.play();
          play.classList.remove('fa-play');
          play.classList.add('fa-pause');
        }
        else
        {
            player.pause();
            play.classList.remove('fa-pause');
            play.classList.add('fa-play');
        }
       
        // if(player.currentTime > 0)
        // {
        //     player.pause();
        // }
        // else
        // {
        //     play.classList.remove('fa-play');
        //     play.classList.add('fa-pause');
        //     player = new Audio(`/${e.target.id}.mp3`);
        //     player.play();  
        // }
       
    });
};

