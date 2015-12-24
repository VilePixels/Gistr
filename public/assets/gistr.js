;(function() {

	Vue.http.headers.common['X-CSRF-TOKEN'] = document.querySelector('#csrf_token').getAttribute('value');

	new Vue({

		el: '#gistr',

		data: {
			gists_data  : {},
			search      : '',
			loading     : true,
			favorites   : false,
			currentPage : 1,
			maxPages    : 1
		},

		computed: {
			showPagination: function() {
				var displayPagination = true;

				if ( this.maxPages < 1 ) {
					displayPagination = false;
				}

				if ( this.search !== '' && this.search !== ' ' ) {
					displayPagination = false;
				}

				if ( this.favorites ) {
					displayPagination = false;
				}

				return displayPagination;
			}
		},

		ready: function() {
			this.fetchGists();
		},

		methods: {
			reset: function() {
				this.gists_data  = {};
				this.search      = '';
				this.loading     = true;
				this.favorites   = false;
				this.currentPage = 1;
				this.maxPages    = 1;
			},

			fetchGists: function() {
				this.reset();

				this.$http.get( 'gists', function ( data ) {

					var gistIndex = 1;

					for ( var gist in data ) {
						
						if ( gistIndex > 20 ) {
							this.maxPages++;
							gistIndex = 1;
						}

						data[gist].page = this.maxPages;

						gistIndex++;
					}

					this.gists_data = data;
					this.loading    = false;

					setTimeout(function() {
						jQuery('code[data-gist-id]').gist();
					}, 0);
				} );
			},

			updateGists: function() {
				this.$http.post( 'gists', { gists: this.gists_data }, function(data) {

				}, {
					emulateJSON: true
				} );
			},

			setPage: function( page ) {
				if ( page < 1 ) {
					page = this.maxPages;
				}

				if ( page > this.maxPages ) {
					page = 1;
				}

				this.currentPage = page;
			},

			toggleFavorites: function() {
				this.favorites = ! this.favorites;
			},

			toggleCode: function(gist) {
				gist.expanded = ( gist.expanded == 1 ) ? 0 : 1;
			},

			copyGist: function(gist, username) {
				var gistURL = 'https://gist.github.com/' + username + '/' + gist.id;

				window.prompt( 'Gist URL:', gistURL );
			},

			favoriteGist: function(gist) {
				gist.favorited = ( gist.favorited == 1 ) ? 0 : 1;
				this.updateGists();
			},

			gistName: function(gist) {
				var gistName = gist.name;

				if ( this.search !== '' && this.search !== ' ' ) {
					var searchQuery  = this.search.trim();
					var searchRegExp = new RegExp( '(' + searchQuery + ')', 'gi' );
					
					gistName = gistName.replace( searchRegExp, '<strong>$1</strong>' );
				}

				return gistName.substr( 0, gistName.lastIndexOf('.') ) || gistName;
			},

			gistShow: function(gist) {
				var showGist = true;
				var gistName = gist.name;

				if ( this.search !== '' && this.search !== ' ' ) {
					var searchQuery = this.search.trim();
					var isMatching  = gistName.match( new RegExp( searchQuery, 'gi' ) );

					if ( ! isMatching ) {
						showGist = false;
					}
				}

				if ( this.favorites && gist.favorited == 0 ) {
					showGist = false;
				}

				if ( ( this.search === '' || this.search === ' ' ) && ! this.favorites ) {
					if ( this.currentPage !== gist.page ) {
						showGist = false;
					}
				}

				return showGist;
			}
		}
	});

})();