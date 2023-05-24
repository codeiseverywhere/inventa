const onReadyPage = () => {

  //const loginBtn = document.querySelectorAll(".js-login-btn");
  const btnPopupLogin = document.querySelector('[aria-controls="account-popover"]');
  const popupLogin = document.querySelector("#account-popover");
  const sortSelectorOptions = document.querySelectorAll(".sortSelector .value-picker__choice-item");
  const searchBox = document.querySelector("header form.search-bar");

  if(searchBox) searchBox.classList.add('opacity-1');
  
  /* if (loginBtn.length > 0) {
    document.addEventListener('click', function(event) {
      if (event.target.matches('.js-login-btn')) {
        event.preventDefault();
        popupLogin.setAttribute("aria-hidden", "false");
        setTimeout(function() {
          btnPopupLogin.click();
        }, 500);
      }
    }, false);
  } */

  if (sortSelectorOptions.length > 0) {
    sortSelectorOptions.forEach( option => {
      option.addEventListener('click', (e) => {
        sortSelectorOptions.forEach( opt => {
          opt.classList.remove('is-selected');
        });
        option.classList.add('is-selected');
      });
    });
  }

  const checkWebResolution = () => {
    const currentWidth = window.innerWidth;
    const desktopOrderSelector = document.querySelector(".sortSelector.desktop");
    if (desktopOrderSelector){
      if (currentWidth < 1000) {
        if (desktopOrderSelector.id != "sort-by-selector2"){
          desktopOrderSelector.id = "sort-by-selector2";
        }
      } else {
        if (desktopOrderSelector.id != "sort-by-selector"){
          desktopOrderSelector.id = "sort-by-selector";
        }
      }
    }
  }

  const fixSearchResultsPosition = () => {
    const scrollPosition = window.pageYOffset;
    const searchResultContainer = document.querySelector("#ui-id-2");
    const bannerElement = document.querySelector("#campaigns-banner");
    const bannerHeight = bannerElement? parseInt(bannerElement.offsetHeight) : 0;
    let topPosition = 107;

    if (searchResultContainer){
      if (scrollPosition < bannerHeight) {
        searchResultContainer.classList.remove("top-position");
        topPosition -= scrollPosition;
      } else {
        searchResultContainer.classList.add("top-position");
      }
    }
  }

  checkWebResolution();
  fixSearchResultsPosition();

  window.addEventListener('resize', checkWebResolution);

  window.onscroll = () => {  
    fixSearchResultsPosition();
  }

}


if (document.readyState == 'loading') {
  document.addEventListener('load', onReadyPage);      
} else {
  setTimeout(() => {
    onReadyPage();   
  }, 1500)
  
}