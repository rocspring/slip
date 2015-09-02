(function() {
	var homeSlideParam = {
		targetSelector: '.topic-info',
		prevSelector: '.topic-info .page-prev',
		nextSelector: '.topic-info .page-next',
		onSlide: function(index) {
			if (index === 0) {
				this.prevEl.children[0].style.opacity = '.5';
				this.nextEl.children[0].style.opacity = '';
			} else if (index == this.getLastIndex()) {
				this.prevEl.children[0].style.opacity = '';
				this.nextEl.children[0].style.opacity = '.5';
			} else {
				this.prevEl.children[0].style.opacity = '';
				this.nextEl.children[0].style.opacity = '';
			}
			/*window.onresize = function() {
				document.querySelector("#topic-swipe").style.transform = "translate3d(-" + (document.body.clientWidth * index) + "px, 0px, 0px)";
				for (var i = 0; i < document.querySelectorAll(".topic-item").length; i++) {
					document.querySelectorAll(".topic-item")[i].style.left = document.documentElement.clientWidth * i + "px";
				}
			};*/
		}
	};

	new Slide(homeSlideParam);
})();