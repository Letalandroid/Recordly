import { describe, expect, it } from "vitest";

import { getGpuSwitches, isLinuxWaylandSession } from "./gpuSwitches";

describe("isLinuxWaylandSession", () => {
	it("detects Wayland from XDG_SESSION_TYPE", () => {
		expect(isLinuxWaylandSession({ XDG_SESSION_TYPE: "wayland" })).toBe(true);
	});

	it("detects X11 from XDG_SESSION_TYPE", () => {
		expect(isLinuxWaylandSession({ XDG_SESSION_TYPE: "x11" })).toBe(false);
	});

	it("prefers an explicit Ozone override over the session type", () => {
		expect(
			isLinuxWaylandSession({ OZONE_PLATFORM: "wayland", XDG_SESSION_TYPE: "x11" }),
		).toBe(true);
		expect(
			isLinuxWaylandSession({ ELECTRON_OZONE_PLATFORM_HINT: "x11", XDG_SESSION_TYPE: "wayland" }),
		).toBe(false);
	});

	it("falls back to WAYLAND_DISPLAY when no session type is set", () => {
		expect(isLinuxWaylandSession({ WAYLAND_DISPLAY: "wayland-0" })).toBe(true);
		expect(isLinuxWaylandSession({})).toBe(false);
	});
});

describe("getGpuSwitches", () => {
	it("uses Metal on macOS", () => {
		expect(getGpuSwitches("darwin")).toEqual({
			useAngle: "metal",
			disableFeatures: ["MacCatapLoopbackAudioForScreenShare"],
		});
	});

	it("uses ANGLE D3D11 on Windows", () => {
		expect(getGpuSwitches("win32")).toEqual({ useAngle: "d3d11" });
	});

	it("does not force a GL/Angle implementation on Linux Wayland", () => {
		expect(getGpuSwitches("linux")).toEqual({
			disableFeatures: ["VaapiVideoDecoder", "VaapiVideoEncoder"],
		});
	});

	it("does not force a GL/Angle implementation on Linux X11", () => {
		expect(getGpuSwitches("linux")).toEqual({
			disableFeatures: ["VaapiVideoDecoder", "VaapiVideoEncoder"],
		});
	});
});
