#[cfg(target_os = "windows")]
mod inner {
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStrExt;

    #[link(name = "advapi32")]
    extern "system" {
        fn OpenProcessToken(process: isize, access: u32, token: *mut isize) -> i32;
        fn GetTokenInformation(
            token: isize,
            class: u32,
            info: *mut core::ffi::c_void,
            len: u32,
            ret: *mut u32,
        ) -> i32;
    }

    #[link(name = "kernel32")]
    extern "system" {
        fn GetCurrentProcess() -> isize;
        fn CloseHandle(h: isize) -> i32;
    }

    #[link(name = "shell32")]
    extern "system" {
        fn ShellExecuteW(
            hwnd: isize,
            op: *const u16,
            file: *const u16,
            params: *const u16,
            dir: *const u16,
            show: i32,
        ) -> isize;
    }

    fn is_admin() -> bool {
        unsafe {
            let mut token: isize = 0;
            // TOKEN_QUERY = 0x0008
            if OpenProcessToken(GetCurrentProcess(), 0x0008, &mut token) == 0 {
                return false;
            }
            #[repr(C)]
            struct Elevation {
                is_elevated: u32,
            }
            let mut elev = Elevation { is_elevated: 0 };
            let mut size = std::mem::size_of::<Elevation>() as u32;
            // TokenElevation = 20
            GetTokenInformation(token, 20, &mut elev as *mut _ as _, size, &mut size);
            CloseHandle(token);
            elev.is_elevated != 0
        }
    }

    /// Comprueba si hay permisos de admin. Si no, relanza la app con UAC y devuelve false.
    pub fn ensure_admin() -> bool {
        if is_admin() {
            return true;
        }
        if let Ok(exe) = std::env::current_exe() {
            let exe_w: Vec<u16> = exe
                .as_os_str()
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();
            let verb: Vec<u16> = OsString::from("runas")
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();
            unsafe {
                ShellExecuteW(
                    0,
                    verb.as_ptr(),
                    exe_w.as_ptr(),
                    std::ptr::null(),
                    std::ptr::null(),
                    1, // SW_SHOWNORMAL
                );
            }
        }
        false
    }
}

#[cfg(target_os = "windows")]
pub use inner::ensure_admin;

#[cfg(not(target_os = "windows"))]
pub fn ensure_admin() -> bool {
    true
}
