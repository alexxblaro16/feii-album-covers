import{r as K,j as p}from"./index-6JHO0hLu.js";import{h as v,O as Ze,ay as Ie,aI as Be,S as B,b as fe,a as T,W as ue,Y as he,am as Je,b3 as et,at as I,V as se,aR as we,f as Se,b4 as tt,C as st,b5 as at,b6 as it,b7 as ot,b8 as rt,b2 as nt,b9 as lt,ba as ct,bb as ut,g as Ve,ar as Te,as as de,bc as ht,bd as pt,be as ft,bf as dt,bg as mt,bh as gt,aJ as ae,aB as X,aK as vt,aF as Oe,e as _e,M as $,ae as xt,b1 as bt,P as Mt,aQ as wt,d as Tt,D as _t,az as Me,bi as St}from"./three.module-DzsMLBvE.js";const pe={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Z{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const yt=new Ze(-1,1,1,-1,0,1);class Ct extends Ie{constructor(){super(),this.setAttribute("position",new Be([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Be([0,2,0,0,2,0],2))}}const Pt=new Ct;class ye{constructor(e){this._mesh=new v(Pt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,yt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class At extends Z{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof B?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=fe.clone(e.uniforms),this.material=new B({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ye(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Fe extends Z{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const a=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let r,o;this.inverse?(r=0,o=1):(r=1,o=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),s.buffers.stencil.setFunc(a.ALWAYS,r,4294967295),s.buffers.stencil.setClear(o),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(a.EQUAL,1,4294967295),s.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),s.buffers.stencil.setLocked(!0)}}class Et extends Z{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Rt{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new T);this._width=n.width,this._height=n.height,t=new ue(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:he}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new At(pe),this.copyPass.material.blending=Je,this.timer=new et}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let a=0,s=this.passes.length;a<s;a++){const r=this.passes[a];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){const o=this.renderer.getContext(),f=this.renderer.state.buffers.stencil;f.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),f.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}Fe!==void 0&&(r instanceof Fe?n=!0:r instanceof Et&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new T);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(n,a),this.renderTarget2.setSize(n,a);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,a)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Ut extends Z{constructor(e,t,n=null,a=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=a,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new I}render(e,t,n){const a=e.autoClear;e.autoClear=!1;let s,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),e.autoClear=a}}const Nt={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new I(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Y extends Z{constructor(e,t=1,n,a){super(),this.strength=t,this.radius=n,this.threshold=a,this.resolution=e!==void 0?new T(e.x,e.y):new T(256,256),this.clearColor=new I(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new ue(s,r,{type:he}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let g=0;g<this.nMips;g++){const _=new ue(s,r,{type:he});_.texture.name="UnrealBloomPass.h"+g,_.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(_);const i=new ue(s,r,{type:he});i.texture.name="UnrealBloomPass.v"+g,i.texture.generateMipmaps=!1,this.renderTargetsVertical.push(i),s=Math.round(s/2),r=Math.round(r/2)}const o=Nt;this.highPassUniforms=fe.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new B({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const f=[6,10,14,18,22];s=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let g=0;g<this.nMips;g++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(f[g])),this.separableBlurMaterials[g].uniforms.invSize.value=new T(1/s,1/r),s=Math.round(s/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const P=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=P,this.bloomTintColors=[new se(1,1,1),new se(1,1,1),new se(1,1,1),new se(1,1,1),new se(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=fe.clone(pe.uniforms),this.blendMaterial=new B({uniforms:this.copyUniforms,vertexShader:pe.vertexShader,fragmentShader:pe.fragmentShader,premultipliedAlpha:!0,blending:we,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new I,this._oldClearAlpha=1,this._basic=new Se,this._fsQuad=new ye(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),a=Math.round(t/2);this.renderTargetBright.setSize(n,a);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,a),this.renderTargetsVertical[s].setSize(n,a),this.separableBlurMaterials[s].uniforms.invSize.value=new T(1/n,1/a),n=Math.round(n/2),a=Math.round(a/2)}render(e,t,n,a,s){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let f=0;f<this.nMips;f++)this._fsQuad.material=this.separableBlurMaterials[f],this.separableBlurMaterials[f].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[f].uniforms.direction.value=Y.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[f]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[f].uniforms.colorTexture.value=this.renderTargetsHorizontal[f].texture,this.separableBlurMaterials[f].uniforms.direction.value=Y.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[f]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[f];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const t=[],n=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(n*n))/n);return new B({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new T(.5,.5)},direction:{value:new T(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new B({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}Y.BlurDirectionX=new T(1,0);Y.BlurDirectionY=new T(0,1);const ce={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Lt extends Z{constructor(){super(),this.isOutputPass=!0,this.uniforms=fe.clone(ce.uniforms),this.material=new tt({name:ce.name,uniforms:this.uniforms,vertexShader:ce.vertexShader,fragmentShader:ce.fragmentShader}),this._fsQuad=new ye(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},st.getTransfer(this._outputColorSpace)===at&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===it?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ot?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===rt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===nt?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===lt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ct?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ut&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const He=`
  uniform float uPhoto; // media anchura de la foto, en radios del disco
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  // 1 en el centro de la foto, 0 donde empieza el vinilo. Funde en círculo para que no se vea el cuadrado.
  float photoMask(vec2 p) {
    vec2 pu = p / uPhoto;
    vec2 e = smoothstep(1.0, 0.9, abs(pu));
    return smoothstep(1.0, 0.62, length(pu)) * e.x * e.y;
  }
`,Dt=`
  uniform sampler2D uDepth;
  uniform float uTime;
  varying vec2 vUv, vPhotoUv;
  ${He}
  void main() {
    vUv = uv;
    vec2 p = (uv - 0.5) * 2.0;
    vPhotoUv = p / uPhoto * 0.5 + 0.5;
    float m = photoMask(p);
    float d = texture2D(uDepth, clamp(vPhotoUv, 0.0, 1.0)).r;
    vec3 pos = position;
    // la foto sale en relieve del propio vinilo y se aplana al llegar a los surcos
    pos.z += max(d - 0.08, 0.0) * 0.5 * m;
    pos.z += smoothstep(0.7, 0.85, d) * sin(uTime * 1.6 + vPhotoUv.x * 6.0) * 0.03 * m;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,Bt=`
  uniform sampler2D uMap, uDepth, uGlow, uHeart, uStrands;
  uniform vec2 uMouse, uLight;
  uniform float uTime, uBoost, uSpin, uTrack, uTrackGlow;
  varying vec2 vUv, vPhotoUv;
  ${He}
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }

  const float R0 = 0.66;   // fin de la zona grabada (justo donde termina la foto)
  const float R1 = 0.975;  // inicio: la primera canción va por fuera, como en un vinilo real
  const float N = 18.0;

  vec3 photo(vec2 puv) {
    float d = texture2D(uDepth, puv).r;
    vec2 uv = puv + uMouse * (d - 0.4) * 0.025;
    float s = texture2D(uStrands, puv).r;
    uv.y += s * (noise(vec2(puv.x * 8.0 - uTime * 0.8, uTime * 0.5)) - 0.5) * 0.006;
    vec3 col = texture2D(uMap, uv).rgb;
    // latido del corazón (doble golpe) + extra al pasar por el tracklist
    float t = mod(uTime, 1.2);
    float beat = exp(-pow((t - 0.10) * 14.0, 2.0)) + 0.6 * exp(-pow((t - 0.35) * 14.0, 2.0));
    col += vec3(1.0, 0.15, 0.3) * texture2D(uHeart, uv).r * (beat * 0.9 + uBoost * 0.8);
    // neones realzados para el bloom
    float g = texture2D(uGlow, uv).r;
    col += col * g * (0.35 + 0.15 * sin(uTime * 2.0 + puv.y * 10.0));
    col += vec3(1.0, 0.3, 0.4) * s * (0.25 + 0.25 * noise(vec2(puv.x * 20.0 + uTime * 2.0, 0.0)));
    return col;
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    float aa = fwidth(r);
    if (r > 1.0) discard;
    float a = atan(p.y, p.x);
    float m = photoMask(p);

    // coordenadas que giran con el disco
    float c = cos(uSpin), sn = sin(uSpin);
    vec2 q = mat2(c, -sn, sn, c) * p;

    // surcos con antialias (se funden a gris medio cuando son más finos que un píxel)
    float gf = r * 600.0;
    float grooves = 0.5 + 0.5 * sin(gf);
    grooves = mix(grooves, 0.5, smoothstep(0.25, 0.7, fwidth(gf) / 6.2831));

    // bandas de pista y separaciones lisas entre canciones
    float inMusic = step(R0, r) * step(r, R1);
    float band = (R1 - r) / (R1 - R0) * N;
    float idx = floor(band);
    float f = fract(band);
    float gap = inMusic * (1.0 - smoothstep(0.0, 0.07, f) * smoothstep(1.0, 0.93, f));

    // vinilo: negro azulado con mármol que gira
    float mb = fbm(q * 2.2 + fbm(q * 3.0 + 4.0) * 1.6);
    vec3 vinyl = mix(vec3(0.006, 0.008, 0.03), vec3(0.04, 0.04, 0.16), smoothstep(0.5, 0.9, mb));
    vinyl *= 0.75 + 0.5 * grooves;

    // foto impresa: también lleva surcos encima, más marcados según se acerca al borde
    vec3 pic = photo(clamp(vPhotoUv, 0.0, 1.0));
    pic *= mix(0.55 + 0.45 * grooves, 0.94 + 0.06 * grooves, smoothstep(0.0, 0.85, m));
    vec3 col = mix(vinyl, pic, m);

    // brillo anisótropo: dos haces opuestos fijos respecto a la luz, sobre todo el disco
    float la = atan(uLight.y, uLight.x);
    float ca = abs(cos(a - la));
    float sheen = pow(ca, 36.0) * 0.75 + pow(ca, 6.0) * 0.08;
    vec3 iri = mix(vec3(0.30, 1.0, 0.85), vec3(1.0, 0.32, 0.85), 0.5 + 0.5 * sin(r * 22.0 + a + uTime * 0.25));
    float surface = inMusic * (1.0 - gap) * (0.35 + 0.65 * grooves) + gap * 0.25 + (1.0 - inMusic) * (0.2 + 0.4 * grooves);
    col += iri * sheen * surface * (1.0 - 0.75 * m) * smoothstep(0.08, 0.3, r);

    float dust = step(0.997, hash(floor(q * 220.0)));
    col += vec3(0.7) * dust * 0.35 * inMusic;

    // la canción que estás señalando se ilumina en su banda
    float hit = inMusic * (1.0 - step(0.5, abs(idx - uTrack)));
    col += vec3(1.0, 0.18, 0.34) * hit * uTrackGlow * (0.3 + 0.9 * sheen + 0.25 * grooves);

    // canto brillante y borde suave
    col += vec3(0.35, 0.4, 1.0) * smoothstep(0.982, 1.0, r) * (0.3 + sheen);
    float alpha = 1.0 - smoothstep(1.0 - aa * 1.5, 1.0, r);
    gl_FragColor = vec4(col, alpha);
  }
`,Ot=`
  attribute float aSeed;
  uniform float uTime, uPixel;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = color;
    vec3 p = position;
    p.y += sin(uTime * 0.3 + aSeed * 30.0) * 0.15;
    p.x += cos(uTime * 0.2 + aSeed * 20.0) * 0.1;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vAlpha = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (1.5 + aSeed * 3.0) + aSeed * 50.0), 3.0);
    gl_PointSize = (3.0 + aSeed * 6.0) * uPixel * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`,Ft=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // estrella de 4 puntas como los destellos de la portada
    float star = max(0.0, 1.0 - (abs(c.x) * abs(c.y) * 60.0 + length(c) * 1.6));
    float core = smoothstep(0.18, 0.0, length(c));
    float a = clamp(star + core, 0.0, 1.0) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
  }
`;class kt extends Ve{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const e=new Te;e.deleteAttribute("uv");const t=new de({side:ht}),n=new de,a=new pt(16777215,900,28,2);a.position.set(.418,16.199,.3),this.add(a);const s=new v(e,t);s.position.set(-.757,13.219,.717),s.scale.set(31.713,28.305,28.591),this.add(s);const r=new ft(e,n,6),o=new dt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),r.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),r.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),r.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),r.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),r.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),r.setMatrixAt(5,o.matrix),this.add(r);const f=new v(e,W(50));f.position.set(-16.116,14.37,8.208),f.scale.set(.1,2.428,2.739),this.add(f);const P=new v(e,W(50));P.position.set(-16.109,18.021,-8.207),P.scale.set(.1,2.425,2.751),this.add(P);const g=new v(e,W(17));g.position.set(14.904,12.198,-1.832),g.scale.set(.15,4.265,6.331),this.add(g);const _=new v(e,W(43));_.position.set(-.462,8.89,14.52),_.scale.set(4.38,5.441,.088),this.add(_);const i=new v(e,W(20));i.position.set(3.235,11.486,-12.541),i.scale.set(2.5,2,.1),this.add(i);const M=new v(e,W(100));M.position.set(0,20,0),M.scale.set(1,.1,1),this.add(M)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function W(c){return new mt({color:0,emissive:16777215,emissiveIntensity:c})}const zt=.66,ke=.975,jt=18,Gt=c=>ke-(c+.5)/jt*(ke-zt);function It({R:c,renderer:e,scene:t}){const n=new gt(e),a=new kt,s=n.fromScene(a,.04);t.environment=s.texture,t.environmentIntensity=.32;const r=new T(-c*1.15,c*.78),o=c*1.1,f=r.length(),P=Math.atan2(-r.y,-r.x),g=-Math.PI/2-.04,_=.15,i=.45,M=S=>{const G=$.clamp((f*f+o*o-S*S)/(2*f*o),-1,1);return P-Math.acos(G)},C=new de({color:"#8f96d8",metalness:1,roughness:.38}),k=new de({color:"#141638",metalness:.6,roughness:.5}),O=S=>S.rotateZ(-Math.PI/2),j=S=>S.rotateX(Math.PI/2),u=new ae;u.position.set(r.x,r.y,0);const m=new v(j(new X(.34,.4,.12,48)),k);m.position.z=.06;const h=new v(new vt(.34,.02,12,64),C);h.position.z=.12;const x=new v(j(new X(.07,.09,.4,24)),C);x.position.z=.25,u.add(m,h,x);const E=new ae,F=new ae;E.add(F),u.add(E);const ie=new v(O(new X(.032,.032,o,16)),C);ie.position.x=o/2-.05;const oe=new v(O(new X(.15,.15,.3,32)),k);oe.position.x=-.38;const re=new v(O(new X(.155,.155,.04,32)),C);re.position.x=-.25;const me=new v(new Oe(.1,24,16),C),A=new v(new Te(.36,.17,.04),C);A.position.set(o-.02,0,0);const U=new v(new Te(.16,.11,.1),k);U.position.set(o,0,-.07);const ge=new v(new Oe(.03,16,12),new Se({color:new I(2.2,.5,1.4)}));ge.position.set(o,0,-.13),F.add(ie,oe,re,me,A,U,ge),F.position.z=i;const w=new v(new _e(o+.7,.5),new B({transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:.3}},vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`varying vec2 vUv; uniform float uOpacity;
        void main(){
          float y = 1.0 - smoothstep(0.0, 0.5, abs(vUv.y - 0.5));
          float x = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
          gl_FragColor = vec4(0.0, 0.0, 0.02, y * y * x * uOpacity);
        }`}));w.renderOrder=2,w.position.set((o+.7)/2-.55,0,.012),E.add(w);let R=g,N=1;function J(S,G,ne,le){const ee=G>=0,H=ee?M(Gt(G)*c):g,L=Math.abs(R-H)<.012;N+=((ee&&L?0:1)-N)*(1-Math.exp(-S*7)),(N>.8||L)&&(R+=(H-R)*(1-Math.exp(-S*5)));const ve=(1-N)*Math.sin(le)*.004;E.rotation.z=R+ve,F.position.z=_+(i-_)*N,F.rotation.y=-.05*N,w.position.y=-.12*N,w.material.uniforms.uOpacity.value=.55-.3*N,u.position.x=r.x-(1-ne)*2.5,u.position.z=-(1-ne)*1.5}function V(){s.dispose(),n.dispose(),a.traverse(S=>{S.geometry?.dispose(),S.material?.dispose?.()})}return{group:u,update:J,dispose:V}}const Vt=1877481995,Ht=`https://itunes.apple.com/lookup?id=${Vt}&entity=song&country=es`;function Qt({onChange:c,onProgress:e}){const t=new Audio;t.crossOrigin="anonymous",t.preload="none";let n=[],a="",s=-1,r,o,f,P,g;const _=new AbortController,i=fetch(Ht,{signal:_.signal}).then(h=>h.json()).then(h=>{for(const x of h.results)x.wrapperType==="collection"&&(a=x.collectionViewUrl),x.wrapperType==="track"&&x.previewUrl&&(n[x.trackNumber-1]=x.previewUrl);return n.length>0}).catch(()=>!1);function M(){if(r)return;r=new AudioContext;const h=r.createMediaElementSource(t);o=r.createGain(),f=r.createAnalyser(),f.fftSize=512,f.smoothingTimeConstant=.6,P=new Uint8Array(f.frequencyBinCount),h.connect(o).connect(f).connect(r.destination)}function C(h,x){const E=r.currentTime;o.gain.cancelScheduledValues(E),o.gain.setValueAtTime(o.gain.value,E),o.gain.linearRampToValueAtTime(h,E+x)}async function k(h){if(n[h]){M(),r.state==="suspended"&&r.resume(),clearTimeout(g),s=h,c(s),t.src=n[h],o.gain.value=0;try{await t.play(),s===h&&C(1,.25)}catch{s===h&&(s=-1,c(s))}}}function O(){if(!(s<0)){if(s=-1,c(s),!r){t.pause();return}C(0,.3),g=setTimeout(()=>t.pause(),320)}}const j=()=>{s=-1,c(s)},u=()=>{s>=0&&t.duration&&e?.(s,t.currentTime/t.duration)};t.addEventListener("ended",j),t.addEventListener("timeupdate",u);function m(){_.abort(),clearTimeout(g),t.removeEventListener("ended",j),t.removeEventListener("timeupdate",u),t.pause(),t.removeAttribute("src"),t.load(),s=-1,r?.close().catch(()=>{})}return{ready:i,get current(){return s},get albumUrl(){return a},has:h=>!!n[h],toggle:h=>s===h?O():k(h),stop:O,destroy:m,progress:()=>t.duration?t.currentTime/t.duration:0,bass(){if(!f||s<0)return 0;f.getByteFrequencyData(P);let h=0;for(let x=1;x<8;x++)h+=P[x];return Math.max(0,(h/7/255-.45)/.55)}}}const Qe={cover:new URL("/feii-album-covers/assets/cover-3sAGQcyD.jpg",import.meta.url).href,depth:new URL("/feii-album-covers/assets/depth-DbclpM2Y.png",import.meta.url).href,glow:new URL("/feii-album-covers/assets/glow-CbYMDko4.png",import.meta.url).href,heart:new URL("/feii-album-covers/assets/heart-CJackS9e.png",import.meta.url).href,strands:new URL("/feii-album-covers/assets/strands-Bo3IsnL3.png",import.meta.url).href},ze=.45,je=3.49;function qt(){const c=document.createElement("canvas");let e="";c.addEventListener("webglcontextcreationerror",t=>{e=t.statusMessage||""});try{const t=c.getContext("webgl2");if(t)return t.getExtension("WEBGL_lose_context")?.loseContext(),null}catch(t){e||=t.message}return e||"WebGL2 no disponible"}function Wt(c,{onRenderer:e}={}){const t=new AbortController,{signal:n}=t,a=(u,m,h,x={})=>u.addEventListener(m,h,{...x,signal:n}),s=[],r=c.querySelector(".psmne__scene"),o=c.querySelector(".psmne__loader"),f=c.querySelector(".psmne__title h1"),P=[...f.querySelectorAll(".ch")],g=[...c.querySelectorAll(".psmne__tracks li")],_=c.querySelector(".psmne__tracklist"),i={boost:0,mouse:new T,target:new T,hover:-1,track:-1,trackGlow:0,spin:0,spinVel:10,dragging:!1,lastX:0,tilt:0,tiltV:0,titleE:0},M=Qt({onChange(u){c.classList.toggle("is-playing",u>=0),g.forEach((m,h)=>{m.classList.toggle("playing",h===u),h!==u&&m.style.setProperty("--p",0),m.querySelector("button").setAttribute("aria-pressed",String(h===u))}),u>=0&&(i.boost=1)},onProgress(u,m){g[u]?.style.setProperty("--p",m.toFixed(4))}});s.push(()=>M.destroy()),M.ready.then(u=>{if(n.aborted)return;c.classList.toggle("no-previews",!u);const m=c.querySelector(".psmne__credit a");u&&M.albumUrl&&(m.href=M.albumUrl),g.forEach((h,x)=>{h.querySelector("button").disabled=!M.has(x)})}),a(window,"keydown",u=>{u.key==="Escape"&&M.stop()});let C;s.push(()=>clearTimeout(C)),g.forEach((u,m)=>{a(u.querySelector("button"),"click",()=>M.toggle(m)),a(u,"mouseenter",()=>{clearTimeout(C),i.boost=1,i.hover=m}),a(u,"mouseleave",()=>{clearTimeout(C),C=setTimeout(()=>{i.hover===m&&(i.hover=-1)},450)})});function k(u){if(n.aborted)return;console.warn("[portada 3D] Sin WebGL:",u),c.classList.add("flat");const m=c.querySelector(".psmne__nowebgl");m.querySelector(".why").textContent=u,m.hidden=!1,o.classList.add("done")}const O=qt();O?k(O):j().catch(u=>k(u?.message||String(u)));async function j(){const u=new xt({canvas:r,antialias:!0});s.push(()=>{u.setAnimationLoop(null),u.dispose()}),u.setPixelRatio(Math.min(devicePixelRatio,1.5)),u.toneMapping=bt,u.info.autoReset=!1;const m=new Ve;s.push(()=>{m.traverse(l=>{l.geometry?.dispose(),(Array.isArray(l.material)?l.material:[l.material]).forEach(b=>b?.dispose())})}),m.background=new I("#02021a");const h=new Mt(35,1,.1,100);h.position.set(0,0,9);const x=new wt,E=await Promise.all(["cover","depth","glow","heart","strands"].map(l=>x.loadAsync(Qe[l])));if(s.push(()=>E.forEach(l=>l.dispose())),n.aborted)return;const[F,ie,oe,re,me]=E;F.colorSpace=Tt,F.anisotropy=u.capabilities.getMaxAnisotropy();const A=new ae;m.add(A);const U=2.7,w={uMap:{value:F},uDepth:{value:ie},uGlow:{value:oe},uHeart:{value:re},uStrands:{value:me},uMouse:{value:new T},uTime:{value:0},uBoost:{value:0},uPhoto:{value:1.75/U},uSpin:{value:0},uLight:{value:new T(1,1)},uTrack:{value:-1},uTrackGlow:{value:0}},R=new ae,N=new v(new _e(U*2,U*2,320,320),new B({uniforms:w,vertexShader:Dt,fragmentShader:Bt,transparent:!0})),J=new v(new X(U*.998,U*.998,.06,192,1,!0),new Se({color:"#1a1c52",side:_t}));J.rotation.x=Math.PI/2,J.position.z=-.031,R.add(N,J),A.add(R);const V=It({R:U,renderer:u,scene:m});s.push(()=>V.dispose()),A.add(V.group);const S=new v(new _e(11,11),new B({transparent:!0,depthWrite:!1,blending:we,uniforms:{uTime:w.uTime},vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`varying vec2 vUv; uniform float uTime;
          void main(){ float d=length(vUv-.5); float a=smoothstep(.5,.0,d)*(.22+.04*sin(uTime*.8));
          gl_FragColor=vec4(vec3(.12,.15,1.)*a,1.); }`}));S.position.z=-1.6,A.add(S);const G=["#4dffd2","#ff4fd8","#ffffff","#7d8bff"].map(l=>new I(l)),ne=new B({transparent:!0,depthWrite:!1,blending:we,vertexColors:!0,uniforms:{uTime:w.uTime,uPixel:{value:u.getPixelRatio()}},vertexShader:Ot,fragmentShader:Ft});function le(l,d){const b=new Float32Array(l*3),y=new Float32Array(l*3),Q=new Float32Array(l);for(let D=0;D<l;D++){b.set(d(),D*3);const q=G[Math.floor(Math.random()*G.length)];y.set([q.r,q.g,q.b],D*3),Q[D]=Math.random()}const z=new Ie;return z.setAttribute("position",new Me(b,3)),z.setAttribute("color",new Me(y,3)),z.setAttribute("aSeed",new Me(Q,1)),new St(z,ne)}const ee=le(420,()=>{const l=Math.random()*Math.PI*2,d=U+.15+Math.pow(Math.random(),1.8)*1.1;return[Math.cos(l)*d,Math.sin(l)*d,(Math.random()-.5)*.35]});R.add(ee);const H=le(380,()=>[(Math.random()-.5)*12,(Math.random()-.5)*8,(Math.random()-.6)*5]);m.add(H);const L=new Rt(u);L.addPass(new Ut(m,h));const ve=new Y(new T(1,1),.85,.6,.55);L.addPass(ve),L.addPass(new Lt),s.push(()=>{L.passes.forEach(l=>l.dispose?.()),L.dispose()});let Ce=9;function Pe(){const l=r.clientWidth,d=r.clientHeight;if(!l||!d)return;u.setSize(l,d,!1),L.setSize(l,d),h.aspect=l/d;const b=innerWidth>860,y=b?Math.max(1,1.75/h.aspect):Math.max(1,1/h.aspect);Ce=(b?11:12.6)*y,h.updateProjectionMatrix()}a(window,"resize",Pe),Pe();const Ae=()=>{i.dragging=!1,r.classList.remove("grabbing")};a(window,"pointermove",l=>{if(i.target.set(l.clientX/innerWidth*2-1,-(l.clientY/innerHeight)*2+1),i.dragging){const d=l.clientX-i.lastX;i.lastX=l.clientX,i.spin+=d*.012,i.spinVel=d*.7}}),a(r,"pointerdown",l=>{i.dragging=!0,i.lastX=l.clientX,r.classList.add("grabbing")}),a(window,"pointerup",Ae),a(window,"pointercancel",Ae),a(window,"deviceorientation",l=>{l.gamma!=null&&i.target.set($.clamp(l.gamma/30,-1,1),$.clamp((l.beta-45)/30,-1,1))}),a(window,"touchstart",()=>{typeof DeviceOrientationEvent?.requestPermission=="function"&&DeviceOrientationEvent.requestPermission().catch(()=>{})},{once:!0});const te=matchMedia("(prefers-reduced-motion: reduce)").matches;function Ee(l,d=1){const b=$.clamp(l,-160,160)*d;i.spinVel+=b*.035,te||(i.tiltV+=b*.012),i.boost=Math.max(i.boost,Math.min(Math.abs(b)/160,1)*.6)}a(c,"wheel",l=>{_.contains(l.target)||Ee(l.deltaY*(l.deltaMode===1?16:1))},{passive:!0});const Re=new WeakMap;a(document,"scroll",l=>{const d=l.target===document?document.scrollingElement:l.target;if(d!==document.scrollingElement&&!c.contains(d))return;const b=Re.get(d)??d.scrollTop;Re.set(d,d.scrollTop),Ee(d.scrollTop-b,.6)},{passive:!0,capture:!0});const qe=performance.now(),We=l=>1-Math.pow(1-l,4);let Ue=0;u.setAnimationLoop(()=>{u.info.reset();const l=(performance.now()-qe)/1e3,d=Math.min(l-Ue,.05);Ue=l;const b=te?1:We(Math.min(l/2.6,1)),y=i.mouse;y.lerp(i.target,.06);const Q=M.current>=0;i.track=Q?M.current:i.hover;const z=Q?M.bass():0;if(i.boost=Math.max(i.boost*.96,z),i.trackGlow+=((i.track>=0?1:0)-i.trackGlow)*.12,!i.dragging){const xe=i.track>=0?je:ze;i.spinVel+=(xe-i.spinVel)*(1-Math.exp(-d*1.6)),i.spin+=i.spinVel*d}w.uTime.value=l,w.uMouse.value.copy(y),w.uBoost.value=i.boost,w.uSpin.value=i.spin,w.uTrack.value=i.track,w.uTrackGlow.value=i.trackGlow*(.75+.8*z),w.uLight.value.set(.6+y.x*1.4,1-y.y*.8);const D=te?0:1;A.rotation.y=y.x*.5+Math.sin(l*.37)*.14*D,i.tiltV+=(-70*i.tilt-9*i.tiltV)*d,i.tilt=$.clamp(i.tilt+i.tiltV*d,-.6,.6);const q=te||innerWidth>860?0:Math.min(scrollY/r.clientHeight,1);if(A.rotation.x=-y.y*.34+Math.cos(l*.29)*.08*D+i.tilt-q*1.05,A.rotation.z=Math.sin(l*.21)*.03*D,A.position.y=Math.sin(l*.7)*.06*D,A.scale.setScalar(1-q*.15),R.position.z=-(1-b)*3-Math.abs(i.tilt)*1.2,R.scale.setScalar(.5+.5*b),R.rotation.y=-(1-b)*1.3,ee.rotation.z=-i.spin*.12,V.update(d,i.track,b,i.spin),V.group.position.z-=Math.abs(i.tilt)*1.2,!te){const xe=i.track>=0?je:ze,Ne=$.clamp((i.spinVel-xe)/6,-1,1);i.titleE+=(Math.abs(Ne)-i.titleE)*(1-Math.exp(-d*6));const be=i.titleE,Le=l%1.2,Xe=Q?z:(Math.exp(-(((Le-.1)*14)**2))+.6*Math.exp(-(((Le-.35)*14)**2)))*i.trackGlow;f.style.setProperty("--e",(be+i.trackGlow*.25).toFixed(3)),P.forEach(($e,De)=>{const Ke=Math.sin(l*5-De*.55)*be*12,Ye=Math.sin(l*4-De*.5)*be*7;$e.style.transform=`translateY(${Ke.toFixed(2)}px) rotate(${Ye.toFixed(2)}deg) skewX(${(-Ne*12).toFixed(2)}deg) scale(${(1+Xe*.06).toFixed(3)})`})}h.position.set(y.x*.6,y.y*.4,Ce+(1-b)*2.5),h.lookAt(0,0,0),H.rotation.y=l*.02+y.x*.1,H.position.x=-y.x*.3,L.render()}),e?.(u),o.classList.add("done")}return()=>{t.abort();for(let u=s.length-1;u>=0;u--)s[u]()}}const Xt=[{title:"OUTRO"},{title:"EL MUNDO SE VA A ACABAR",feat:"KARBeats"},{title:"FOREVER TU GANTEL",feat:"Ñengo Flow"},{title:"L a k e n o s h i"},{title:"VAMOaCOCHI"},{title:"SUSU"},{title:"SIRENA"},{title:"GANTEL y BELLAKz",feat:"Bassyy"},{title:"SI ESTÁS CON ALGUIEN"},{title:"Dulces SueñoZzz (+INTERLUDIO)",feat:"Rubí"},{title:"$UELTA GATITA $UELTA",feat:"Dei V, Clarent"},{title:"WHAT U NEED? (SexPlaylist 2)",feat:"Myke Towers"},{title:"WO OH OH",feat:"ROA"},{title:"KOKO"},{title:"COMERNOS",feat:"Bad Gyal"},{title:"SKY"},{title:"MOONLIGHT",feat:"Eladio Carrión"},{title:"POR SI MAÑANA NO ESTOY"}],Ge="route-por-si-manana-no-estoy",$t="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,500;12..96,800&family=JetBrains+Mono:wght@400;600&display=swap",Kt=["Por Si Mañana","No Estoy"];function Yt(){return p.jsx("h1",{"aria-label":"Por Si Mañana No Estoy",children:Kt.map((c,e)=>p.jsxs("span",{"aria-hidden":"true",children:[e>0&&p.jsx("br",{}),c.split(" ").map((t,n)=>p.jsxs("span",{children:[n>0&&" ",p.jsx("span",{className:"word",children:[...t].map((a,s)=>p.jsx("span",{className:"ch",children:a},s))})]},n))]},c))})}function Zt({renderer:c}){const[e,t]=K.useState(null);return K.useEffect(()=>{if(!c)return;const n=setInterval(()=>{t({calls:c.info.render.calls,triangles:c.info.render.triangles,geometries:c.info.memory.geometries,textures:c.info.memory.textures})},1e3);return()=>clearInterval(n)},[c]),e?p.jsx("pre",{className:"psmne__budget","aria-label":"renderer.info",children:`calls ${e.calls}
triangles ${e.triangles}
geometries ${e.geometries}
textures ${e.textures}`}):null}function ts(){const c=K.useRef(null),[e,t]=K.useState(null),[n]=K.useState(()=>new URLSearchParams(window.location.search).has("budget"));return K.useEffect(()=>{const a=document.documentElement;a.classList.add(Ge);const s=document.createElement("link");s.rel="stylesheet",s.href=$t,document.head.append(s);const r=Wt(c.current,{onRenderer:t});return()=>{r(),s.remove(),a.classList.remove(Ge),t(null)}},[]),p.jsxs("div",{className:"psmne",ref:c,children:[p.jsxs("div",{className:"psmne__loader",role:"status",children:[p.jsx("span",{className:"psmne__loader-heart","aria-hidden":"true"}),p.jsx("p",{children:"Cargando…"})]}),p.jsx("canvas",{className:"psmne__scene","aria-label":"Portada del álbum en 3D: arrastra para girar el vinilo"}),p.jsxs("main",{className:"psmne__ui",children:[p.jsxs("header",{className:"psmne__title",children:[p.jsx("p",{className:"kicker",children:"Omar Courtz · 2026"}),p.jsx(Yt,{}),p.jsx("p",{className:"meta",children:"18 canciones · 1 h 10 min"}),p.jsx("a",{className:"listen",href:"https://open.spotify.com/album/6A7uWpBb4nHbiBHWRlZi5f",target:"_blank",rel:"noopener noreferrer",children:"▶ Escuchar en Spotify"})]}),p.jsxs("section",{className:"psmne__tracklist","aria-label":"Tracklist",children:[p.jsx("h2",{children:"Tracklist"}),p.jsxs("p",{className:"psmne__credit",children:["Toca una canción para escuchar 30 s · fragmentos de"," ",p.jsx("a",{href:"https://music.apple.com/",target:"_blank",rel:"noopener noreferrer",children:"Apple Music"})]}),p.jsx("ol",{className:"psmne__tracks",children:Xt.map((a,s)=>p.jsx("li",{style:{animationDelay:`${.6+s*.05}s`},children:p.jsxs("button",{type:"button",className:"track","aria-pressed":"false",children:[p.jsxs("span",{className:"n",children:[p.jsx("span",{className:"num",children:String(s+1).padStart(2,"0")}),p.jsxs("span",{className:"eq","aria-hidden":"true",children:[p.jsx("i",{}),p.jsx("i",{}),p.jsx("i",{})]})]}),p.jsxs("span",{className:"t",children:[a.title,a.feat&&p.jsxs("span",{className:"f",children:["con ",a.feat]})]})]})},a.title))})]})]}),p.jsx("p",{className:"psmne__hint",children:"Mueve el ratón · arrastra o haz scroll en el vinilo"}),p.jsxs("div",{className:"psmne__flat-disc","aria-hidden":"true",children:[p.jsx("div",{className:"psmne__flat-vinyl"}),p.jsx("img",{src:Qe.cover,alt:""})]}),p.jsxs("p",{className:"psmne__nowebgl",hidden:!0,children:["WebGL está desactivado, por eso ves la versión sin 3D. En Chrome:"," ",p.jsx("strong",{children:"Ajustes › Sistema › «Usar aceleración gráfica cuando esté disponible»"})," y reinicia el navegador.",p.jsx("span",{className:"why"})]}),n&&p.jsx(Zt,{renderer:e})]})}export{ts as default};
