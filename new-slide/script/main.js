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
			console.log('test');
		}
	};

	new Slide(homeSlideParam);
})();