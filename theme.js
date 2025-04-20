window.theme = window.theme || {};
var THMHelper = window.BEYHelper || {};
THMHelper.qs = document.querySelector.bind(document);
THMHelper.qsa = document.querySelectorAll.bind(document);
THMHelper.qid = document.getElementById.bind(document);
THMHelper.qde = document.documentElement;
class THMLazyLoadingVideo extends HTMLElement {
    constructor() {
      super(),
        (this.iframe = this.querySelector("iframe")),
        (this.template = this.querySelector("template")),
        (this.isMouseenter = !1);
    }
    loadVideo() {
      var t;
      this.iframe &&
        (this.iframe.setAttribute("src", this.iframe.getAttribute("data-src")),
        this.iframe.addEventListener(
          "load",
          function () {
            "youtube" == this.dataVideoType &&
              this.iframe.contentWindow.postMessage(
                '{"event":"command","func":"playVideo","args":""}',
                "*"
              ),
              "vimeo" == this.dataVideoType &&
                this.iframe.contentWindow.postMessage('{"method":"play"}', "*");
          }.bind(this)
        )),
        "local_video" == this.dataVideoType &&
          ((this.local_video = this.querySelector("video")),
          (t = this.local_video.querySelector("source").getAttribute("data-src")),
          (this.local_video.src = t));
    }
    execute() {
      Shopify.designMode
        ? this.loadVideo()
        : (["mousemove", "touchstart"].forEach(
            function (t) {
              THMHelper.qs("body").addEventListener(
                t,
                function (t) {
                  this.isMouseenter || this.loadVideo(), (this.isMouseenter = !0);
                }.bind(this),
                { once: !0 }
              );
            }.bind(this)
          ),
          window.addEventListener(
            "scroll",
            function (t) {
              this.isMouseenter || this.loadVideo(), (this.isMouseenter = !0);
            }.bind(this),
            { once: !0 }
          ));
    }
    static get observedAttributes() {
      return ["data-video-type", "data-video-id"];
    }
    set dataVideoType(t) {
      this.setAttribute("data-video-type", t);
    }
    get dataVideoType() {
      return this.getAttribute("data-video-type");
    }
    set dataVideoId(t) {
      this.setAttribute("data-video-id", t);
    }
    get dataVideoId() {
      return this.getAttribute("data-video-id");
    }
    attributeChangedCallback(t, e, s) {
      e !== s && this.execute();
    }
    connectedCallback() {
      this.execute();
    }
    disconnectedCallback() {}
  }
  customElements.define("thm-load-video", THMLazyLoadingVideo);

  class THMLoadMedia extends HTMLElement {
    constructor() {
      super(),
        (this.$ = this.querySelector.bind(this)),
        (this.sectionID = this.dataset.sectionId),
        (this.idVideo = this.dataset.idVideo),
        (this.typeVideo = this.dataset.type),
        (this.eleVideo = `shtVideo-${this.sectionID}-` + this.idVideo),
        (this.onPlayerStateYTChange = this.onPlayerStateYTChange.bind(this)),
        (this.onPlayerPlay = this.onPlayerPlay.bind(this)),
        (this.trigger = this.$(".js-load-media-trigger")),
        this.trigger &&
          this.trigger.addEventListener("click", this.handlePlayVideo.bind(this));
    }
    handlePlayVideo() {
      this.classList.add("playing");
      this.loadContent();
      const t = this.querySelector(".js-media-item-video");
      t &&
        t.addEventListener("play", () => {
          this.pauseAllVideo(t), t.play();
        });
    }
    onYouTubeIframeAPIReady() {
      if ("undefined" != typeof YT && void 0 !== YT.Player)
        try {
          this.player = new YT.Player(this.eleVideo, {
            videoId: this.idVideo,
            playerVars: { playsinline: 1 },
            events: {
              onReady: this.onPlayerYTReady,
              onStateChange: this.onPlayerStateYTChange,
            },
          });
        } catch (t) {
          console.error("Lỗi khi tạo trình phát YouTube:", t);
        }
      else {
        var t = document.createElement("script"),
          e =
            ((t.src = "https://www.youtube.com/iframe_api"),
            (t.onload = () => {
              this.onYouTubeIframeAPIReady();
            }),
            document.getElementsByTagName("script")[0]);
        e.parentNode.insertBefore(t, e);
      }
    }
    onVimeoIframeAPIReady() {
      if ("undefined" != typeof Vimeo && void 0 !== Vimeo.Player)
        try {
          var t = { id: this.idVideo, autoplay: 1 };
          (this.playerVimeo = new Vimeo.Player(this.eleVideo, t)),
            this.playerVimeo.on("play", () => {
              this.pauseAllVideo(this.playerVimeo);
            });
        } catch (t) {
          console.error("Lỗi khi tạo trình phát Vimeo:", t);
        }
      else {
        var t = document.createElement("script"),
          e =
            ((t.src = "https://player.vimeo.com/api/player.js"),
            (t.onload = () => {
              this.onVimeoIframeAPIReady();
            }),
            document.getElementsByTagName("script")[0]);
        e.parentNode.insertBefore(t, e);
      }
    }
    onPlayerYTReady = () => {
      this.pauseAllVideo(this.player), this.player.playVideo();
    };
    onPlayerStateYTChange = (t) => {
      1 == t.data && this.onPlayerPlay();
    };
    onPlayerPlay = () => {
      this.pauseAllVideo(this.player);
    };
    loadContent() {
      if (!this.getAttribute("loaded")) {
        if (this.$("template")) {
          var t = this.$("template").content.firstElementChild.cloneNode(!0);
          this.appendChild(t),
            this.isLoaded(!0),
            this.trigger && this.trigger.remove();
        } else {
          if ("youtube" == this.typeVideo) this.onYouTubeIframeAPIReady();
          else {
            if ("vimeo" != this.typeVideo) return !0;
            this.onVimeoIframeAPIReady();
          }
          this.trigger?.classList.add("d-none"),
            this.$(".js-media-item").classList.add("d-flex");
        }
        return !0;
      }
    }
    pauseAllVideo(e) {
      THMHelper.qsa(
        ".js-product-media-deferred-video:has([data-type='youtube']"
      ).forEach((t) => {
        t.player && e !== t.player && t.player?.pauseVideo();
      }),
      THMHelper.qsa(
          ".js-product-media-deferred-video:has([data-type='vimeo'])"
        ).forEach((t) => {
          t.playerVimeo !== e && t.playerVimeo?.pause();
        }),
        THMHelper.qsa(".js-media-item-video").forEach((t) => {
          t !== e && t.pause();
        });
    }
    isLoaded(t) {
      t ? this.setAttribute("loaded", !0) : this.removeAttribute("loaded");
    }
  }
  customElements.define("thm-load-media", THMLoadMedia);
