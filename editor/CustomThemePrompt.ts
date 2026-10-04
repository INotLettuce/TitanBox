import { HTML } from "imperative-html/dist/esm/elements-strict";
import { Prompt } from "./Prompt";
import { SongDocument } from "./SongDocument";

import { PatternEditor } from "./PatternEditor";
import { ColorConfig } from "./ColorConfig";

//namespace beepbox {
const { button, div, h2, input, p, label, details, summary } = HTML;
let doReload = false;

interface ThemePickerColor {
	name: string;
	property: string;
	defaultValue: string;
}

const corePickerColors: ThemePickerColor[] = [
	{ name: "Page", property: "--page-margin", defaultValue: "#16191c" },
	{ name: "Editor", property: "--editor-background", defaultValue: "#16191c" },
	{ name: "Panels", property: "--ui-widget-background", defaultValue: "#252b30" },
	{ name: "Text", property: "--primary-text", defaultValue: "#f5f5f7" },
	{ name: "Accent", property: "--loop-accent", defaultValue: "#00f0ff" },
	{ name: "Focused controls", property: "--ui-widget-focus", defaultValue: "#00f0ff" },
	{ name: "Piano background", property: "--pitch-background", defaultValue: "#252b30" },
	{ name: "Third notes", property: "--third-note", defaultValue: "#9000f0" },
];

const pickerColorContext: CanvasRenderingContext2D | null = document.createElement("canvas").getContext("2d");

function toPickerColor(value: string): string | null {
	if (pickerColorContext == null || !CSS.supports("color", value) || /var\(/i.test(value)) return null;
	pickerColorContext.fillStyle = "#000000";
	pickerColorContext.fillStyle = value;
	const normalized = pickerColorContext.fillStyle;
	const hex = normalized.match(/^#([0-9a-f]{6})$/i);
	if (hex != null) return `#${hex[1]}`;
	const rgb = normalized.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
	if (rgb == null) return null;
	return `#${rgb.slice(1, 4).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("")}`;
}

function readPickerColor(css: string, property: string): string | null {
	const declarations = [...css.matchAll(new RegExp(`${property}\\s*:\\s*([^;{}]+)`, "g"))];
	for (let index = declarations.length - 1; index >= 0; index--) {
		const color = toPickerColor(declarations[index][1].trim());
		if (color != null) return color;
	}
	return null;
}

function getThemePickerColors(): ThemePickerColor[] {
	const colors = [...corePickerColors];
	const knownProperties = new Set(colors.map((color) => color.property));
	const selectedTheme = localStorage.getItem("colorTheme") || ColorConfig.defaultTheme;
	const themes = [ColorConfig.themes[selectedTheme], ColorConfig.themes[ColorConfig.defaultTheme], ...Object.values(ColorConfig.themes)];
	for (const theme of themes) {
		if (theme == null) continue;
		for (const declaration of theme.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) {
			const property = declaration[1];
			const color = toPickerColor(declaration[2].trim());
			if (color == null || knownProperties.has(property)) continue;
			knownProperties.add(property);
			colors.push({ name: property.slice(2).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), property, defaultValue: color });
		}
	}
	return colors;
}

export class CustomThemePrompt implements Prompt {
	private readonly _pickerColors: ThemePickerColor[] = getThemePickerColors();
	private readonly _colorPickers: HTMLInputElement[] = this._pickerColors.map(({ property, defaultValue }) => {
		const existingColor = readPickerColor(localStorage.getItem("customColors") || "", property);
		const picker = input({ type: "color", value: existingColor || defaultValue });
		picker.dataset.property = property;
		return picker;
	});
	private readonly _fileInput: HTMLInputElement = input({ type: "file", accept: "image/*", text: "choose editor background image"});
	private readonly _fileInput2: HTMLInputElement = input({ type: "file", accept: "image/*", text: "choose website background image" });
	private readonly _colorInput: HTMLInputElement = input({ type: "text", value: localStorage.getItem("customColors") || `:root {
	--page-margin: black;
	--editor-background: black;
	--hover-preview: white;
	--playhead: white;
	--primary-text: white;
	--secondary-text: #999;
	--inverted-text: black;
	--text-selection: rgba(119,68,255,0.99);
	--box-selection-fill: rgba(255,255,255,0.2);
	--loop-accent: #74f;
	--link-accent: #98f;
	--ui-widget-background: #444;
	--ui-widget-focus: #777;
	--pitch-background: #444;
	--tonic: #864;
	--fifth-note: #468;
	--third-note: #9000f0;
	--white-piano-key: #bbb;
	--black-piano-key: #444;
	--white-piano-key-text: #131200;
	--black-piano-key-text: #fff;
	--use-color-formula: false;
	--track-editor-bg-pitch: #444;
	--track-editor-bg-pitch-dim: #333;
	--track-editor-bg-noise: #444;
	--track-editor-bg-noise-dim: #333;
	--track-editor-bg-mod: #234;
	--track-editor-bg-mod-dim: #123;
	--multiplicative-mod-slider: #456;
	--overwriting-mod-slider: #654;
	--indicator-primary: #74f;
	--indicator-secondary: #444;
	--select2-opt-group: #585858;
	--input-box-outline: #333;
	--mute-button-normal: #ffa033;
	--mute-button-mod: #9a6bff;
	--pitch1-secondary-channel: #0099A1;
	--pitch1-primary-channel:   #25F3FF;
	--pitch1-secondary-note:    #00BDC7;
	--pitch1-primary-note:      #92F9FF;
	--pitch2-secondary-channel: #A1A100;
	--pitch2-primary-channel:   #FFFF25;
	--pitch2-secondary-note:    #C7C700;
	--pitch2-primary-note:      #FFFF92;
	--pitch3-secondary-channel: #C75000;
	--pitch3-primary-channel:   #FF9752;
	--pitch3-secondary-note:    #FF771C;
	--pitch3-primary-note:      #FFCDAB;
	--pitch4-secondary-channel: #00A100;
	--pitch4-primary-channel:   #50FF50;
	--pitch4-secondary-note:    #00C700;
	--pitch4-primary-note:      #A0FFA0;
	--pitch5-secondary-channel: #D020D0;
	--pitch5-primary-channel:   #FF90FF;
	--pitch5-secondary-note:    #E040E0;
	--pitch5-primary-note:      #FFC0FF;
	--pitch6-secondary-channel: #7777B0;
	--pitch6-primary-channel:   #A0A0FF;
	--pitch6-secondary-note:    #8888D0;
	--pitch6-primary-note:      #D0D0FF;
	--pitch7-secondary-channel: #8AA100;
	--pitch7-primary-channel:   #DEFF25;
	--pitch7-secondary-note:    #AAC700;
	--pitch7-primary-note:      #E6FF92;
	--pitch8-secondary-channel: #DF0019;
	--pitch8-primary-channel:   #FF98A4;
	--pitch8-secondary-note:    #FF4E63;
	--pitch8-primary-note:      #FFB2BB;
	--pitch9-secondary-channel: #00A170;
	--pitch9-primary-channel:   #50FFC9;
	--pitch9-secondary-note:    #00C78A;
	--pitch9-primary-note:      #83FFD9;
	--pitch10-secondary-channel:#A11FFF;
	--pitch10-primary-channel:  #CE8BFF;
	--pitch10-secondary-note:   #B757FF;
	--pitch10-primary-note:     #DFACFF;
	--noise1-secondary-channel: #6F6F6F;
	--noise1-primary-channel:   #AAAAAA;
	--noise1-secondary-note:    #A7A7A7;
	--noise1-primary-note:      #E0E0E0;
	--noise2-secondary-channel: #996633;
	--noise2-primary-channel:   #DDAA77;
	--noise2-secondary-note:    #CC9966;
	--noise2-primary-note:      #F0D0BB;
	--noise3-secondary-channel: #4A6D8F;
	--noise3-primary-channel:   #77AADD;
	--noise3-secondary-note:    #6F9FCF;
	--noise3-primary-note:      #BBD7FF;
	--noise4-secondary-channel: #7A4F9A;
	--noise4-primary-channel:   #AF82D2;
	--noise4-secondary-note:    #9E71C1;
	--noise4-primary-note:      #D4C1EA;
	--noise5-secondary-channel: #607837;
	--noise5-primary-channel:   #A2BB77;
	--noise5-secondary-note:    #91AA66;
	--noise5-primary-note:      #C5E2B2;
	--mod1-secondary-channel:   #339955;
	--mod1-primary-channel:     #77fc55;
	--mod1-secondary-note:      #77ff8a;
	--mod1-primary-note:        #cdffee;
	--mod2-secondary-channel:   #993355;
	--mod2-primary-channel:     #f04960;
	--mod2-secondary-note:      #f057a0;
	--mod2-primary-note:        #ffb8de;
	--mod3-secondary-channel:   #553399;
	--mod3-primary-channel:     #8855fc;
	--mod3-secondary-note:      #aa64ff;
	--mod3-primary-note:	    #f8ddff;
	--mod4-secondary-channel:   #a86436;
	--mod4-primary-channel:     #c8a825;
	--mod4-secondary-note:      #e8ba46;
	--mod4-primary-note:        #fff6d3;
	--mod-label-primary:        #999;
	--mod-label-secondary-text: #333;
	--mod-label-primary-text:   black;
	--disabled-note-primary:    #999;
	--disabled-note-secondary:  #666; }`});
	private readonly _cancelButton: HTMLButtonElement = button({ class: "cancelButton" });
	private readonly _okayButton: HTMLButtonElement = button({ class: "okayButton", style: "width:45%;" }, "Okay");
	private readonly _resetButton: HTMLButtonElement = button({ style: "height: auto; min-height: var(--button-size);" }, "Reset to defaults");
	private readonly _pickerOverrides: Map<string, string> = new Map<string, string>();

	public readonly container: HTMLDivElement = div({ class: "prompt noSelection", style: "width: 360px; max-height: 90%; overflow-y: auto;" },
		h2("Custom Theme"),
        div(),
        p({ style: "text-align: left; margin: 0;" },
            "Editor Background Image:",
            this._fileInput
        ),
        p({ style: "text-align: left; margin: 0.5em 0;" },
            "Website Background Image:",
            this._fileInput2
        ),
		p({ style: "text-align: left; margin: 0;" }, "Choose theme colors:"),
		div({ style: "display: grid; grid-template-columns: 1fr 1fr; gap: 0.5em; text-align: left;" },
			...this._pickerColors.slice(0, corePickerColors.length).map(({ name }, index) =>
				label({ style: "display: flex; align-items: center; justify-content: space-between; gap: 0.5em;" }, name, this._colorPickers[index]),
			),
		),
		details({ style: "text-align: left;" },
			summary("More mod and channel colors"),
			div({ style: "display: grid; grid-template-columns: 1fr 1fr; gap: 0.5em; max-height: 220px; overflow-y: auto;" },
				...this._pickerColors.slice(corePickerColors.length).map(({ name }, index) =>
					label({ style: "display: flex; align-items: center; justify-content: space-between; gap: 0.5em;" }, name, this._colorPickers[index + corePickerColors.length]),
				),
			),
		),
        div(),
        p({ style: "text-align: left; margin: 0;" },
            "Replace the text below with your custom theme data to load it:",
        ),
        this._colorInput,
        div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" },
            this._resetButton
        ),
        div({ style: "display: flex; flex-direction: row-reverse; justify-content: space-between;" },
            this._okayButton,
        ),
        this._cancelButton,
    );
    // private readonly lastTheme: string | null = window.localStorage.getItem("colorTheme")

    constructor(private _doc: SongDocument, private _pattern: PatternEditor, private _pattern2: HTMLDivElement, private _pattern3: HTMLElement) {
		for (const picker of this._colorPickers) picker.addEventListener("input", this._whenPickerChanged);
		const existingOverrides = this._colorInput.value.match(/\/\* Color picker overrides \*\/([\s\S]*?)\/\* End color picker overrides \*\//)?.[1] || "";
		for (const declaration of existingOverrides.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
			const color = toPickerColor(declaration[2].trim());
			if (color != null) this._pickerOverrides.set(declaration[1], color);
		}
        this._fileInput.addEventListener("change", this._whenFileSelected);
        this._fileInput2.addEventListener("change", this._whenFileSelected2);
        this._colorInput.addEventListener("change", this._whenColorsChanged);
        this._okayButton.addEventListener("click", this._close);
        this._cancelButton.addEventListener("click", this._close);
        this._resetButton.addEventListener("click", this._reset);
    }

    private _close = (): void => {
        this._doc.prompt = null;
        this._doc.undo();
        if (doReload) {
            // The prompt seems to get stuck if reloading is done too quickly.
            setTimeout(() => { window.location.reload(); }, 50);
        }
    }

    public cleanUp = (): void => {
		for (const picker of this._colorPickers) picker.removeEventListener("input", this._whenPickerChanged);
        this._okayButton.removeEventListener("click", this._close);
        this._cancelButton.removeEventListener("click", this._close);
        // this.container.removeEventListener("keydown", this._whenKeyPressed);
        this._resetButton.removeEventListener("click", this._reset);
    }
    private _reset = (): void => {
        window.localStorage.removeItem("colorTheme");
        window.localStorage.removeItem("customTheme");
        window.localStorage.removeItem("customTheme2");
        window.localStorage.removeItem("customColors");
        this._pattern._svg.style.backgroundImage = "";
        document.body.style.backgroundImage = "";
        this._pattern2.style.backgroundImage = "";
        this._pattern3.style.backgroundImage = "";
        const secondImage: HTMLElement | null = document.getElementById("secondImage");
        if (secondImage != null) {
            secondImage.style.backgroundImage = "";
        }
        doReload = true;
        this._close();
    }
    private _whenColorsChanged = (): void => {
        localStorage.setItem("customColors", this._colorInput.value);
        window.localStorage.setItem("colorTheme", "custom");
        this._doc.colorTheme = "custom";
		ColorConfig.setTheme("custom");
		this._doc.notifier.changed();
	}
	private _whenPickerChanged = (event: Event): void => {
		const picker = event.currentTarget as HTMLInputElement;
		const property = picker.dataset.property;
		if (property != null) this._pickerOverrides.set(property, picker.value);
		const overrides = [...this._pickerOverrides].map(([name, value]) => `${name}: ${value};`).join("\n\t");
		const baseColors = this._colorInput.value.replace(/\n?\/\* Color picker overrides \*\/[\s\S]*?\/\* End color picker overrides \*\//g, "");
		this._colorInput.value = `${baseColors}\n\n/* Color picker overrides */\n:root {\n\t${overrides}\n}\n/* End color picker overrides */`;
		this._whenColorsChanged();
    }
    private _whenFileSelected = (): void => {
        const file: File = this._fileInput.files![0];
        if (!file) return;
        const reader: FileReader = new FileReader();
        reader.addEventListener("load", (event: Event): void => {
            //this._doc.prompt = null;
            //this._doc.goBackToStart();
            let base64 = <string>reader.result;
            window.localStorage.setItem("customTheme", base64);
            const value = `url("${window.localStorage.getItem('customTheme')}")`
            console.log('setting', value)
            this._pattern._svg.style.backgroundImage = value;
            console.log('done')
        });
        reader.readAsDataURL(file);
    }
    private _whenFileSelected2 = (): void => {
        const file: File = this._fileInput2.files![0];
        if (!file) return;
        const reader: FileReader = new FileReader();
        reader.addEventListener("load", (event: Event): void => {
            //this._doc.prompt = null;
            //this._doc.goBackToStart();
            let base64 = <string>reader.result;
            window.localStorage.setItem("customTheme2", base64);
            const value = `url("${window.localStorage.getItem('customTheme2')}")`
            document.body.style.backgroundImage = `url(${base64})`;
            this._pattern2.style.backgroundImage = value;
            this._pattern3.style.backgroundImage = value;
            const secondImage: HTMLElement | null = document.getElementById("secondImage");
            if (secondImage != null) {
                secondImage.style.backgroundImage = `url(${base64})`;
            }
            // document.body.style.backgroundImage = `url(${newURL})`;
            // window.localStorage.setItem("customTheme2", <string>reader.result);
            // this._doc.record(new ChangeSong(this._doc, <string>reader.result), true, true);
        });
        reader.readAsDataURL(file);
    }
    // private _whenKeyPressed = (event: KeyboardEvent): void => {
    // 	if ((<Element>event.target).tagName != "BUTTON" && event.keyCode == 13) { // Enter key
    // 		this._saveChanges();
    // 	}
    // }

    // private _previewTheme = (): void => {
    // 	ColorConfig.setTheme(this._themeSelect.value);
    // }
}
//}