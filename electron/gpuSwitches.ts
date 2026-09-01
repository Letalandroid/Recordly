export interface GpuSwitches {
	useAngle?: string;
	useGl?: string;
	disableFeatures?: string[];
}

/**
 * Detects whether the Linux session runs under Wayland (vs X11). Used to decide
 * whether screen capture can safely enumerate sources via
 * `desktopCapturer.getSources` (X11) or must use the portal sentinel path
 * (Wayland), where enumeration itself triggers an xdg-desktop-portal dialog.
 */
export function isLinuxWaylandSession(env: NodeJS.ProcessEnv = process.env): boolean {
	const ozone =
		env.OZONE_PLATFORM?.toLowerCase() ?? env.ELECTRON_OZONE_PLATFORM_HINT?.toLowerCase();
	if (ozone === "wayland") {
		return true;
	}
	if (ozone === "x11") {
		return false;
	}
	const sessionType = env.XDG_SESSION_TYPE?.toLowerCase();
	if (sessionType === "wayland") {
		return true;
	}
	if (sessionType === "x11") {
		return false;
	}
	return Boolean(env.WAYLAND_DISPLAY);
}

export function getGpuSwitches(platform: NodeJS.Platform): GpuSwitches {
	if (platform === "darwin") {
		return {
			useAngle: "metal",
			disableFeatures: ["MacCatapLoopbackAudioForScreenShare"],
		};
	}

	if (platform === "win32") {
		return { useAngle: "d3d11" };
	}

	if (platform === "linux") {
		// Modern Electron/Chromium builds on Linux only allow the ANGLE EGL
		// implementation (`gl=egl-angle,angle=default`), which is exactly what
		// Chromium selects by default when no GL/Angle switch is forced.
		// Forcing `--use-gl=egl` maps to the raw `egl-gles2`/`angle=none` path
		// and `--use-angle=egl` is not a recognized backend value — both make
		// the GPU process request a disallowed implementation and crash, which
		// silently degrades every WebGL context to software (SwiftShader)
		// rendering. Let Chromium pick its default instead.
		return {
			disableFeatures: ["VaapiVideoDecoder", "VaapiVideoEncoder"],
		};
	}

	return {};
}
