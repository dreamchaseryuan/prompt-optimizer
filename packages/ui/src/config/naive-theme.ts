// Naive UI 主题配置 - 全面基于 Naive UI 的 themeOverrides 系统
import { computed, ref, watch } from 'vue'

import { darkTheme, lightTheme, type GlobalThemeOverrides, type GlobalTheme } from 'naive-ui'
import { pinia } from '../plugins/pinia'
import { useGlobalSettings } from '../stores/settings/useGlobalSettings'

// 当前主题ID
export const currentThemeId = ref<string>('light')

// 主题类型定义
export interface ThemeConfig {
  id: string
  labelKey: string
  naiveTheme: GlobalTheme | null
  themeOverrides: GlobalThemeOverrides
}

// 纯Naive UI主题配置 - 完全消除CSS依赖
export const naiveThemeConfigs: Record<string, ThemeConfig> = {
  light: {
    id: 'light',
    labelKey: 'theme.light',
    naiveTheme: lightTheme,
    // Violet Ink 日间色板（oklch 换算 hex，见 docs/ui-redesign-design.md §1.2）
    themeOverrides: {
      common: {
        // 品牌主色：深紫罗兰 Violet Ink（hue 310）
        primaryColor: '#8a3aa9',
        primaryColorHover: '#783196',
        primaryColorPressed: '#672781',
        primaryColorSuppl: '#a24cc0',
        // 语义色（低饱和）
        successColor: '#1d9457',
        successColorHover: '#1d9457',
        successColorPressed: '#1d9457',
        successColorSuppl: '#1d9457',
        warningColor: '#b57a1a',
        warningColorHover: '#b57a1a',
        warningColorPressed: '#b57a1a',
        warningColorSuppl: '#b57a1a',
        errorColor: '#c93a4b',
        errorColorHover: '#c93a4b',
        errorColorPressed: '#c93a4b',
        errorColorSuppl: '#c93a4b',
        infoColor: '#3b6ba3',
        infoColorHover: '#3b6ba3',
        infoColorPressed: '#3b6ba3',
        infoColorSuppl: '#3b6ba3',
        // 表面：紫调纸灰底 + 近白面板 + 纯白 raised
        borderRadius: '8px',
        borderRadiusSmall: '6px',
        fontWeightStrong: '600',
        fontFamily:
          "var(--ds-font-ui, system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei UI', sans-serif)",
        fontFamilyMono:
          "var(--ds-font-family-mono, 'IBM Plex Mono', ui-monospace, 'Cascadia Code', Consolas, monospace)",
        bodyColor: '#f4f2f6',
        cardColor: '#fbfafc',
        modalColor: '#ffffff',
        popoverColor: '#ffffff',
        tableColor: '#f4f2f6',
        tableColorHover: 'rgba(138, 58, 169, 0.05)',
        inputColor: '#ffffff',
        actionColor: '#eeebf1',
        hoverColor: 'rgba(138, 58, 169, 0.08)',
        // 文字
        textColorBase: '#2b2433',
        textColor1: '#2b2433',
        textColor2: '#38313f',
        textColor3: '#675e71',
        placeholderColor: '#857c90',
        textColorDisabled: '#aaa2b2',
        iconColor: '#857c90',
        iconColorHover: '#675e71',
        iconColorPressed: '#38313f',
        iconColorDisabled: '#aaa2b2',
        // 边线
        borderColor: '#e0dce4',
        dividerColor: '#e9e5ec',
        scrollbarColor: 'rgba(133, 124, 144, 0.30)',
        scrollbarColorHover: 'rgba(133, 124, 144, 0.50)',
        closeIconColor: 'rgba(103, 94, 113, 0.65)',
        closeIconColorHover: '#675e71',
        closeIconColorPressed: '#2b2433',
        clearColor: 'rgba(103, 94, 113, 0.2)',
        clearColorHover: 'rgba(103, 94, 113, 0.28)',
        clearColorPressed: 'rgba(103, 94, 113, 0.36)'
      },
      // 主按钮：紫底白字；默认按钮：白底细边
      Button: {
        // 禁用态：显式中性色 + 关闭全局 .5 透明度（与深色主题同策略）
        opacityDisabled: '1',
        textColorPrimary: '#ffffff',
        textColorHoverPrimary: '#ffffff',
        textColorPressedPrimary: '#ffffff',
        textColorFocusPrimary: '#ffffff',
        textColorDisabledPrimary: 'rgba(56, 49, 63, 0.38)',
        colorPrimary: '#8a3aa9',
        colorHoverPrimary: '#783196',
        colorPressedPrimary: '#672781',
        colorFocusPrimary: '#8a3aa9',
        colorDisabledPrimary: 'rgba(120, 110, 132, 0.10)',
        borderPrimary: '1px solid #8a3aa9',
        borderHoverPrimary: '1px solid #783196',
        borderPressedPrimary: '1px solid #672781',
        borderFocusPrimary: '1px solid #8a3aa9',
        borderDisabledPrimary: '1px solid rgba(120, 110, 132, 0.16)',
        rippleColorPrimary: 'rgba(138, 58, 169, 0.25)',
        textColorGhostPrimary: '#8a3aa9',
        textColorGhostHoverPrimary: '#783196',
        textColorGhostPressedPrimary: '#672781',
        textColorGhostFocusPrimary: '#8a3aa9',
        textColor: '#38313f',
        textColorHover: '#2b2433',
        textColorPressed: '#2b2433',
        color: '#ffffff',
        colorHover: '#eae6ee',
        colorPressed: '#e0dce4',
        border: '1px solid #e0dce4',
        borderHover: '1px solid #d2ccd8',
        borderPressed: '1px solid #d2ccd8',
        borderFocus: '1px solid #8a3aa9'
      },
      // 输入框：白底 + 2px 主色聚焦环
      Input: {
        color: '#ffffff',
        colorDisabled: '#eeebf1',
        colorFocus: '#ffffff',
        textColor: '#38313f',
        textColorDisabled: 'rgba(43, 36, 51, 0.4)',
        placeholderColor: '#857c90',
        placeholderColorDisabled: 'rgba(133, 124, 144, 0.6)',
        iconColor: '#857c90',
        iconColorHover: '#675e71',
        iconColorPressed: '#38313f',
        iconColorDisabled: 'rgba(133, 124, 144, 0.5)',
        clearColor: 'rgba(103, 94, 113, 0.2)',
        clearColorHover: 'rgba(103, 94, 113, 0.3)',
        clearColorPressed: 'rgba(103, 94, 113, 0.4)',
        border: '1px solid #e0dce4',
        borderDisabled: '1px solid rgba(224, 220, 228, 0.7)',
        borderHover: '1px solid #d2ccd8',
        borderFocus: '1px solid #8a3aa9',
        boxShadowFocus: '0 0 0 2px rgba(138, 58, 169, 0.35)',
        caretColor: '#8a3aa9',
        suffixTextColor: '#857c90',
        prefixTextColor: '#857c90'
      },
      // 卡片：近白 + 8px 圆角 + 平面零阴影（层级交给边框与色阶）
      Card: {
        color: '#fbfafc',
        colorModal: '#fbfafc',
        colorTarget: '#fbfafc',
        textColor: '#38313f',
        titleTextColor: '#2b2433',
        borderColor: '#e9e5ec',
        actionColor: '#eeebf1',
        closeIconColor: '#857c90',
        closeIconColorHover: '#675e71',
        closeIconColorPressed: '#38313f',
        borderRadius: '8px',
        boxShadow: 'none'
      },
      // 页签胶囊
      Tabs: {
        tabColor: '#eeebf1',
        tabColorActive: '#fbfafc',
        tabBorderColor: '#e0dce4',
        tabTextColorBar: '#675e71',
        tabTextColorBarHover: '#38313f',
        tabTextColorBarActive: '#2b2433',
        tabTextColorCard: '#675e71',
        tabTextColorCardActive: '#2b2433',
        barColor: '#8a3aa9'
      },
      // 模式页签（Radio button 组）：弱主色，强调文字层级
      Radio: {
        buttonBorderColor: '#e0dce4',
        buttonBorderColorActive: '#8a3aa9',
        buttonColor: '#ffffff',
        buttonColorActive: '#eae6ee',
        buttonTextColor: '#675e71',
        buttonTextColorActive: '#38313f',
        buttonBoxShadow: 'none',
        buttonBoxShadowFocus: 'none'
      },
      Dropdown: {
        color: '#ffffff',
        optionTextColor: '#675e71',
        optionTextColorHover: '#38313f',
        optionTextColorActive: '#2b2433',
        optionColorHover: '#eae6ee',
        optionColorActive: 'rgba(138, 58, 169, 0.14)',
        borderRadius: '12px',
        borderColor: '#e9e5ec',
        boxShadow:
          '0 8px 24px rgba(77, 68, 88, 0.08), 0 32px 80px rgba(77, 68, 88, 0.12)'
      },
      Modal: {
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow:
          '0 8px 24px rgba(77, 68, 88, 0.08), 0 32px 80px rgba(77, 68, 88, 0.12)'
      },
      Drawer: {
        color: '#ffffff',
        borderColor: '#e0dce4'
      },
      Popover: {
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow:
          '0 8px 24px rgba(77, 68, 88, 0.08), 0 32px 80px rgba(77, 68, 88, 0.12)'
      },
      Tooltip: { color: '#2b2433' },
      Tag: {
        color: 'transparent',
        textColor: '#675e71',
        border: '1px solid #d2ccd8',
        borderRadius: '4px',
        colorPrimary: 'transparent',
        textColorPrimary: '#a24cc0',
        borderPrimary: '1px solid #a24cc0'
      },
      Empty: {
        iconColor: '#aaa2b2',
        textColor: '#857c90'
      },
      Dialog: {
        borderRadius: '12px',
        iconColor: '#3b6ba3',
        iconColorSuccess: '#1d9457',
        iconColorWarning: '#b57a1a',
        iconColorError: '#c93a4b'
      },
      Scrollbar: {
        color: 'rgba(133, 124, 144, 0.30)',
        colorHover: 'rgba(133, 124, 144, 0.50)'
      },
      Divider: { color: '#e9e5ec' },
      Layout: { color: '#eeebf1' },
      Switch: {
        railColorActive: '#8a3aa9',
        boxShadowFocus: '0 0 0 2px rgba(138, 58, 169, 0.35)'
      },
      Checkbox: {
        colorChecked: '#8a3aa9',
        borderChecked: '1px solid #8a3aa9',
        colorFocus: 'rgba(138, 58, 169, 0.14)'
      },
      Progress: { fillColor: '#8a3aa9' },
      Slider: { fillColor: '#8a3aa9' },
      Pagination: {
        itemColorActive: '#8a3aa9',
        itemTextColorActive: '#ffffff'
      },
      Select: {
        peers: {
          InternalSelection: {
            colorActive: '#ffffff',
            borderActive: '1px solid #8a3aa9',
            boxShadowActive: '0 0 0 2px rgba(138, 58, 169, 0.35)'
          }
        }
      }
    }
  },

  dark: {
    id: 'dark',
    labelKey: 'theme.dark',
    naiveTheme: darkTheme,
    // Violet Ink 深色色板：暖深灰紫调底（主战场，见 docs/ui-redesign-design.md §1.2）
    themeOverrides: {
      common: {
        primaryColor: '#985cb2',
        primaryColorHover: '#ab76c1',
        primaryColorPressed: '#864da1',
        primaryColorSuppl: '#c395d7',
        successColor: '#4ec07e',
        successColorHover: '#4ec07e',
        successColorPressed: '#4ec07e',
        successColorSuppl: '#4ec07e',
        warningColor: '#dfa243',
        warningColorHover: '#dfa243',
        warningColorPressed: '#dfa243',
        warningColorSuppl: '#dfa243',
        errorColor: '#e2606c',
        errorColorHover: '#e2606c',
        errorColorPressed: '#e2606c',
        errorColorSuppl: '#e2606c',
        infoColor: '#62a0d8',
        infoColorHover: '#62a0d8',
        infoColorPressed: '#62a0d8',
        infoColorSuppl: '#62a0d8',
        borderRadius: '8px',
        borderRadiusSmall: '6px',
        fontWeightStrong: '600',
        fontFamily:
          "var(--ds-font-ui, system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei UI', sans-serif)",
        fontFamilyMono:
          "var(--ds-font-family-mono, 'IBM Plex Mono', ui-monospace, 'Cascadia Code', Consolas, monospace)",
        bodyColor: '#1a1720',
        cardColor: '#292434',
        modalColor: '#312b3d',
        popoverColor: '#312b3d',
        tableColor: '#292434',
        tableColorHover: 'rgba(157, 95, 184, 0.08)',
        inputColor: '#312b3d',
        actionColor: '#221e2a',
        hoverColor: 'rgba(157, 95, 184, 0.12)',
        textColorBase: '#efedf2',
        textColor1: '#efedf2',
        textColor2: '#e2dfe7',
        textColor3: '#b7b1c0',
        placeholderColor: '#8c8499',
        textColorDisabled: '#6b6478',
        iconColor: '#8c8499',
        iconColorHover: '#b7b1c0',
        iconColorPressed: '#e2dfe7',
        iconColorDisabled: '#6b6478',
        borderColor: '#37303f',
        dividerColor: '#2c2735',
        scrollbarColor: 'rgba(140, 132, 153, 0.30)',
        scrollbarColorHover: 'rgba(140, 132, 153, 0.50)',
        closeIconColor: 'rgba(183, 177, 192, 0.65)',
        closeIconColorHover: '#b7b1c0',
        closeIconColorPressed: '#e2dfe7',
        clearColor: 'rgba(183, 177, 192, 0.2)',
        clearColorHover: 'rgba(183, 177, 192, 0.28)',
        clearColorPressed: 'rgba(183, 177, 192, 0.36)'
      },
      Button: {
        // 禁用态：显式中性色 + 关闭全局 .5 透明度，避免主按钮“洗成淡紫”读作故障
        opacityDisabled: '1',
        textColorPrimary: '#ffffff',
        textColorHoverPrimary: '#ffffff',
        textColorPressedPrimary: '#ffffff',
        textColorFocusPrimary: '#ffffff',
        textColorDisabledPrimary: 'rgba(226, 223, 231, 0.34)',
        colorPrimary: '#9d5fb8',
        colorHoverPrimary: '#b07ac7',
        colorPressedPrimary: '#8a4fa6',
        colorFocusPrimary: '#9d5fb8',
        colorDisabledPrimary: 'rgba(255, 255, 255, 0.055)',
        borderPrimary: '1px solid #9d5fb8',
        borderHoverPrimary: '1px solid #b07ac7',
        borderPressedPrimary: '1px solid #8a4fa6',
        borderFocusPrimary: '1px solid #9d5fb8',
        borderDisabledPrimary: '1px solid rgba(255, 255, 255, 0.075)',
        rippleColorPrimary: 'rgba(157, 95, 184, 0.3)',
        textColorGhostPrimary: '#c99ade',
        textColorGhostHoverPrimary: '#b07ac7',
        textColorGhostPressedPrimary: '#8a4fa6',
        textColorGhostFocusPrimary: '#c99ade',
        textColor: '#e2dfe7',
        textColorHover: '#efedf2',
        textColorPressed: '#efedf2',
        color: '#292434',
        colorHover: '#3a3347',
        colorPressed: '#453d51',
        border: '1px solid #37303f',
        borderHover: '1px solid #453d51',
        borderPressed: '1px solid #453d51',
        borderFocus: '1px solid #9d5fb8'
      },
      Input: {
        color: '#312b3d',
        colorDisabled: '#292434',
        colorFocus: '#312b3d',
        textColor: '#e2dfe7',
        textColorDisabled: 'rgba(226, 223, 231, 0.35)',
        placeholderColor: '#8c8499',
        placeholderColorDisabled: 'rgba(140, 132, 153, 0.5)',
        iconColor: '#8c8499',
        iconColorHover: '#b7b1c0',
        iconColorPressed: '#e2dfe7',
        iconColorDisabled: 'rgba(140, 132, 153, 0.5)',
        clearColor: 'rgba(183, 177, 192, 0.2)',
        clearColorHover: 'rgba(183, 177, 192, 0.3)',
        clearColorPressed: 'rgba(183, 177, 192, 0.4)',
        border: '1px solid #37303f',
        borderDisabled: '1px solid rgba(55, 48, 63, 0.6)',
        borderHover: '1px solid #453d51',
        borderFocus: '1px solid #9d5fb8',
        boxShadowFocus: '0 0 0 2px rgba(157, 95, 184, 0.35)',
        caretColor: '#9d5fb8'
      },
      Card: {
        color: '#292434',
        colorModal: '#292434',
        colorTarget: '#292434',
        textColor: '#e2dfe7',
        titleTextColor: '#efedf2',
        borderColor: '#2c2735',
        actionColor: '#221e2a',
        borderRadius: '8px',
        boxShadow: 'none'
      },
      Tabs: {
        tabColor: '#221e2a',
        tabColorActive: '#312b3d',
        tabBorderColor: '#37303f',
        tabTextColorBar: '#8c8499',
        tabTextColorBarHover: '#b7b1c0',
        tabTextColorBarActive: '#efedf2',
        tabTextColorCard: '#8c8499',
        tabTextColorCardActive: '#efedf2',
        barColor: '#9d5fb8'
      },
      Radio: {
        buttonBorderColor: '#37303f',
        buttonBorderColorActive: '#9d5fb8',
        buttonColor: '#312b3d',
        buttonColorActive: '#3a3347',
        buttonTextColor: '#8c8499',
        buttonTextColorActive: '#e2dfe7',
        buttonBoxShadow: 'none',
        buttonBoxShadowFocus: 'none'
      },
      Dropdown: {
        color: '#312b3d',
        optionTextColor: '#b7b1c0',
        optionTextColorHover: '#e2dfe7',
        optionTextColorActive: '#efedf2',
        optionColorHover: '#3a3347',
        optionColorActive: 'rgba(157, 95, 184, 0.16)',
        borderRadius: '12px',
        borderColor: '#37303f',
        boxShadow:
          '0 8px 24px rgba(20, 17, 26, 0.45), 0 32px 80px rgba(20, 17, 26, 0.55)'
      },
      Modal: {
        color: '#312b3d',
        borderRadius: '12px',
        boxShadow:
          '0 8px 24px rgba(20, 17, 26, 0.45), 0 32px 80px rgba(20, 17, 26, 0.55)'
      },
      Drawer: {
        color: '#312b3d',
        borderColor: '#37303f'
      },
      Popover: {
        color: '#312b3d',
        borderRadius: '12px',
        boxShadow:
          '0 8px 24px rgba(20, 17, 26, 0.45), 0 32px 80px rgba(20, 17, 26, 0.55)'
      },
      Tooltip: { color: '#3a3347' },
      Tag: {
        color: 'transparent',
        textColor: '#b7b1c0',
        border: '1px solid #453d51',
        borderRadius: '4px',
        colorPrimary: 'transparent',
        textColorPrimary: '#c99ade',
        borderPrimary: '1px solid #c99ade'
      },
      Empty: {
        iconColor: '#6b6478',
        textColor: '#8c8499'
      },
      Dialog: {
        borderRadius: '12px',
        iconColor: '#62a0d8',
        iconColorSuccess: '#4ec07e',
        iconColorWarning: '#dfa243',
        iconColorError: '#e2606c'
      },
      Scrollbar: {
        color: 'rgba(140, 132, 153, 0.30)',
        colorHover: 'rgba(140, 132, 153, 0.50)'
      },
      Divider: { color: '#2c2735' },
      Layout: { color: '#221e2a' },
      Switch: {
        railColorActive: '#9d5fb8',
        boxShadowFocus: '0 0 0 2px rgba(157, 95, 184, 0.35)'
      },
      Checkbox: {
        colorChecked: '#9d5fb8',
        borderChecked: '1px solid #9d5fb8',
        colorFocus: 'rgba(157, 95, 184, 0.16)'
      },
      Progress: { fillColor: '#9d5fb8' },
      Slider: { fillColor: '#9d5fb8' },
      Pagination: {
        itemColorActive: '#9d5fb8',
        itemTextColorActive: '#ffffff'
      },
      Select: {
        peers: {
          InternalSelection: {
            colorActive: '#312b3d',
            borderActive: '1px solid #9d5fb8',
            boxShadowActive: '0 0 0 2px rgba(157, 95, 184, 0.35)'
          }
        }
      }
    }
  },

  blue: {
    id: 'blue',
    labelKey: 'theme.blue',
    naiveTheme: lightTheme,
    themeOverrides: {
      common: {
        primaryColor: '#1f6bd1',
        primaryColorHover: '#185cb8',
        primaryColorPressed: '#134c98',
        primaryColorSuppl: '#6caef7',
        bodyColor: '#e4f0ff',
        cardColor: '#f6faff',
        modalColor: '#f6faff',
        popoverColor: '#f6faff',
        tableColor: '#eef5ff',
        inputColor: '#ffffff',
        hoverColor: 'rgba(31, 107, 209, 0.08)',
        actionColor: '#eaf3ff',
        textColorBase: '#0f2f55',
        textColor1: '#0f2f55',
        textColor2: '#1d4d85',
        textColor3: '#4a6c91',
        placeholderColor: '#6f88aa',
        borderColor: '#92bbea',
        dividerColor: '#c6dcf6',
        scrollbarColor: 'rgba(41, 98, 158, 0.35)',
        scrollbarColorHover: 'rgba(24, 76, 126, 0.55)',
        closeIconColor: 'rgba(26, 69, 119, 0.7)',
        closeIconColorHover: '#185cb8',
        closeIconColorPressed: '#134c98',
        clearColor: 'rgba(31, 107, 209, 0.25)',
        clearColorHover: 'rgba(31, 107, 209, 0.35)',
        clearColorPressed: 'rgba(31, 107, 209, 0.45)'
      },
      Button: {
        textColorPrimary: '#ffffff',
        textColorHoverPrimary: '#ffffff',
        textColorPressedPrimary: '#ffffff',
        textColorFocusPrimary: '#ffffff',
        textColorDisabledPrimary: 'rgba(255, 255, 255, 0.6)',
        colorPrimary: '#1f6bd1',
        colorHoverPrimary: '#185cb8',
        colorPressedPrimary: '#134c98',
        colorFocusPrimary: '#1f6bd1',
        colorDisabledPrimary: '#a1c6f1',
        borderPrimary: '1px solid #1f6bd1',
        borderHoverPrimary: '1px solid #185cb8',
        borderPressedPrimary: '1px solid #134c98',
        borderFocusPrimary: '1px solid #1f6bd1',
        borderDisabledPrimary: '1px solid #a1c6f1',
        rippleColorPrimary: 'rgba(31, 107, 209, 0.25)',
        textColor: '#1d4d85',
        textColorHover: '#16406f',
        textColorPressed: '#0f2f55',
        color: '#eaf3ff',
        colorHover: '#deebff',
        colorPressed: '#cfe1ff',
        border: '1px solid #c0d8f6',
        borderHover: '1px solid #aaccf2',
        borderPressed: '1px solid #97bfec'
      },
      Input: {
        color: '#ffffff',
        colorDisabled: '#f0f5fb',
        colorFocus: '#ffffff',
        textColor: '#0f2f55',
        textColorDisabled: 'rgba(15, 47, 85, 0.45)',
        placeholderColor: '#6f88aa',
        placeholderColorDisabled: 'rgba(111, 136, 170, 0.6)',
        iconColor: '#6f88aa',
        iconColorHover: '#2c5e9b',
        iconColorPressed: '#214a7d',
        iconColorDisabled: 'rgba(111, 136, 170, 0.5)',
        clearColor: 'rgba(31, 107, 209, 0.25)',
        clearColorHover: 'rgba(31, 107, 209, 0.35)',
        clearColorPressed: 'rgba(31, 107, 209, 0.45)',
        border: '1px solid #b2cef2',
        borderDisabled: '1px solid rgba(178, 206, 242, 0.6)',
        borderHover: '1px solid #9ac0ec',
        borderFocus: '1px solid #78ace4',
        boxShadowFocus: '0 0 0 2px rgba(31, 107, 209, 0.2)',
        caretColor: '#1f6bd1',
        suffixTextColor: '#4a6c91',
        prefixTextColor: '#4a6c91'
      },
      Card: {
        color: '#f6faff',
        colorModal: '#f6faff',
        colorTarget: '#f6faff',
        textColor: '#0f2f55',
        titleTextColor: '#0c2443',
        borderColor: '#b2cef2',
        actionColor: '#e3efff',
        closeIconColor: '#6f88aa',
        closeIconColorHover: '#2c5e9b',
        closeIconColorPressed: '#214a7d',
        boxShadow: '0 16px 36px rgba(15, 47, 85, 0.12)'
      },
      Tabs: {
        tabColor: '#eaf3ff',
        tabColorActive: '#cfe1ff',
        tabBorderColor: '#b2cef2',
        tabTextColorBar: '#4a6c91',
        tabTextColorBarHover: '#1d4d85',
        tabTextColorBarActive: '#0f2f55',
        tabTextColorCard: '#4a6c91',
        tabTextColorCardActive: '#0f2f55',
        barColor: '#8fb9ec'
      },
      Radio: {
        buttonBorderColor: '#b2cef2',
        buttonBorderColorActive: '#8fb9ec',
        buttonColor: '#eaf3ff',
        buttonColorActive: '#d2e5ff',
        buttonTextColor: '#4a6c91',
        buttonTextColorActive: '#0f2f55'
      },
      Dropdown: {
        color: '#ffffff',
        optionTextColor: '#1d4d85',
        optionTextColorHover: '#0f2f55',
        optionTextColorActive: '#0f2f55',
        optionColorHover: '#e1efff',
        optionColorActive: '#cfe1ff',
        borderColor: '#b2cef2'
      }
    }
  },

  classic: {
    id: 'classic',
    labelKey: 'theme.classic',
    naiveTheme: lightTheme,
    themeOverrides: {
      common: {
        primaryColor: '#7b6a58',
        primaryColorHover: '#6a5a4a',
        primaryColorPressed: '#594a3d',
        primaryColorSuppl: '#d7ccbc',
        successColor: '#059669',
        successColorHover: '#047857',
        successColorPressed: '#065f46',
        successColorSuppl: '#dcfce7',
        errorColor: '#dc2626',
        errorColorHover: '#b91c1c',
        errorColorPressed: '#991b1b',
        errorColorSuppl: '#fee2e2',
        bodyColor: '#f5f2ec',
        cardColor: '#fefcf8',
        modalColor: '#f9f5ef',
        popoverColor: '#fefcf8',
        tableColor: '#f7f1e8',
        inputColor: '#f8f4ee',
        hoverColor: 'rgba(123, 106, 88, 0.08)',
        textColorBase: '#403830',
        textColor1: '#403830',
        textColor2: '#6a6156',
        textColor3: '#968d82',
        placeholderColor: '#b0a79c',
        borderColor: '#e3d7c7',
        dividerColor: '#ede3d6',
        scrollbarColor: 'rgba(141, 126, 110, 0.4)',
        scrollbarColorHover: 'rgba(123, 106, 88, 0.55)',
        closeIconColor: 'rgba(103, 92, 80, 0.7)',
        closeIconColorHover: '#675c50',
        closeIconColorPressed: '#51473d',
        clearColor: 'rgba(123, 106, 88, 0.2)',
        clearColorHover: 'rgba(123, 106, 88, 0.3)',
        clearColorPressed: 'rgba(123, 106, 88, 0.4)',
        boxShadow1: '0 6px 20px rgba(87, 69, 55, 0.08)',
        boxShadow2: '0 12px 32px rgba(87, 69, 55, 0.12)'
      },
      Button: {
        textColorPrimary: '#3f382f',
        textColorHoverPrimary: '#3f382f',
        textColorPressedPrimary: '#3f382f',
        textColorFocusPrimary: '#3f382f',
        textColorDisabledPrimary: 'rgba(63, 56, 47, 0.4)',
        colorPrimary: '#d7ccbc',
        colorHoverPrimary: '#cabfaa',
        colorPressedPrimary: '#beb29a',
        colorFocusPrimary: '#d7ccbc',
        colorDisabledPrimary: '#e5dbcf',
        borderPrimary: '1px solid #cabfaa',
        borderHoverPrimary: '1px solid #b9ac96',
        borderPressedPrimary: '1px solid #a59782',
        borderFocusPrimary: '1px solid #cabfaa',
        borderDisabledPrimary: '1px solid #e2d6c7',
        rippleColorPrimary: 'rgba(123, 106, 88, 0.35)',
        textColor: '#4c443c',
        textColorHover: '#3f382f',
        textColorPressed: '#3f382f',
        color: '#f6f1ea',
        colorHover: '#ede3d6',
        colorPressed: '#e1d6c7',
        border: '1px solid #e3d7c7',
        borderHover: '1px solid #d8ccba',
        borderPressed: '1px solid #cbbca5'
      },
      Input: {
        color: '#f8f4ee',
        colorDisabled: '#f3ede5',
        colorFocus: '#fefbf7',
        textColor: '#403830',
        textColorDisabled: 'rgba(64, 56, 48, 0.45)',
        placeholderColor: '#b0a79c',
        placeholderColorDisabled: 'rgba(176, 167, 156, 0.6)',
        iconColor: '#a29688',
        iconColorHover: '#877b6d',
        iconColorPressed: '#6e6256',
        iconColorDisabled: 'rgba(162, 150, 136, 0.5)',
        clearColor: 'rgba(123, 106, 88, 0.2)',
        clearColorHover: 'rgba(123, 106, 88, 0.32)',
        clearColorPressed: 'rgba(123, 106, 88, 0.45)',
        border: '1px solid #d8cdbd',
        borderDisabled: '1px solid rgba(216, 205, 189, 0.6)',
        borderHover: '1px solid #cbbfae',
        borderFocus: '1px solid #bfae99',
        boxShadowFocus: '0 0 0 2px rgba(123, 106, 88, 0.16)',
        caretColor: '#7b6a58',
        suffixTextColor: '#8a7c6c',
        prefixTextColor: '#8a7c6c'
      },
      Card: {
        color: '#fefcf8',
        colorModal: '#fefcf8',
        colorTarget: '#fefcf8',
        textColor: '#403830',
        titleTextColor: '#3a332b',
        borderColor: '#e3d7c7',
        actionColor: '#f3eadf',
        closeIconColor: '#8f8376',
        closeIconColorHover: '#6e6256',
        closeIconColorPressed: '#5a4f45',
        boxShadow: '0 12px 32px rgba(87, 69, 55, 0.12)'
      },
      Tabs: {
        tabColor: '#f1ece4',
        tabColorActive: '#e4d8c8',
        tabBorderColor: '#e3d7c7',
        tabTextColorBar: '#6a6156',
        tabTextColorBarHover: '#4d453c',
        tabTextColorBarActive: '#4d453c',
        tabTextColorCard: '#6a6156',
        tabTextColorCardActive: '#3f382f',
        barColor: '#d2c5b5'
      },
      Radio: {
        buttonBorderColor: '#e3d7c7',
        buttonBorderColorActive: '#cabfaa',
        buttonColor: '#f6f1ea',
        buttonColorActive: '#d7ccbc',
        buttonTextColor: '#6a6156',
        buttonTextColorActive: '#3f382f'
      },
      Dropdown: {
        color: '#fefcf8',
        optionTextColor: '#4c443c',
        optionTextColorHover: '#3f382f',
        optionTextColorActive: '#3f382f',
        optionColorHover: '#ede3d6',
        optionColorActive: '#e1d6c7',
        borderColor: '#e3d7c7'
      }
    }
  },

  green: {
    id: 'green',
    labelKey: 'theme.green',
    naiveTheme: darkTheme,
    themeOverrides: {
      common: {
        primaryColor: '#1fb598',
        primaryColorHover: '#1aa184',
        primaryColorPressed: '#16846c',
        primaryColorSuppl: '#57e4c8',
        bodyColor: '#0f342b',
        cardColor: '#174737',
        modalColor: '#174737',
        popoverColor: '#174737',
        tableColor: '#1b4f3d',
        tableHeaderColor: '#1f5f49',
        inputColor: '#1d5240',
        codeColor: '#1f5f49',
        tabColor: '#1f5f49',
        actionColor: '#1f5f49',
        textColorBase: '#e9fbf4',
        textColor1: 'rgba(233, 251, 244, 0.96)',
        textColor2: 'rgba(233, 251, 244, 0.82)',
        textColor3: 'rgba(233, 251, 244, 0.6)',
        textColorDisabled: 'rgba(233, 251, 244, 0.4)',
        placeholderColor: 'rgba(197, 239, 224, 0.7)',
        placeholderColorDisabled: 'rgba(197, 239, 224, 0.45)',
        iconColor: 'rgba(207, 246, 232, 0.75)',
        iconColorHover: 'rgba(207, 246, 232, 0.88)',
        iconColorPressed: '#e9fbf4',
        iconColorDisabled: 'rgba(207, 246, 232, 0.45)',
        borderColor: 'rgba(47, 128, 109, 0.45)',
        dividerColor: 'rgba(47, 128, 109, 0.25)',
        scrollbarColor: 'rgba(38, 108, 92, 0.35)',
        scrollbarColorHover: 'rgba(38, 108, 92, 0.55)',
        closeIconColor: 'rgba(207, 246, 232, 0.7)',
        closeIconColorHover: 'rgba(207, 246, 232, 0.88)',
        closeIconColorPressed: '#e9fbf4',
        clearColor: 'rgba(233, 251, 244, 0.6)',
        clearColorHover: 'rgba(233, 251, 244, 0.75)',
        clearColorPressed: 'rgba(233, 251, 244, 0.9)',
        successColor: '#3dd68c',
        successColorHover: '#2fb973',
        successColorPressed: '#258f59',
        successColorSuppl: '#174f3b',
        errorColor: '#ff6b6b',
        errorColorHover: '#f05252',
        errorColorPressed: '#c73f3f',
        errorColorSuppl: '#4d2020'
      },
      Button: {
        textColorPrimary: '#0f342b',
        textColorHoverPrimary: '#0b271f',
        textColorPressedPrimary: '#092017',
        textColorFocusPrimary: '#0f342b',
        textColorDisabledPrimary: 'rgba(15, 52, 43, 0.82)',
        colorPrimary: '#57e4c8',
        colorHoverPrimary: '#3fd2b4',
        colorPressedPrimary: '#2eb39a',
        colorFocusPrimary: '#57e4c8',
        colorDisabledPrimary: '#459f8d',
        borderPrimary: '1px solid #3fd2b4',
        borderHoverPrimary: '1px solid #2eb39a',
        borderPressedPrimary: '1px solid #258f76',
        borderFocusPrimary: '1px solid #3fd2b4',
        borderDisabledPrimary: '1px solid rgba(63, 210, 180, 0.35)',
        rippleColorPrimary: 'rgba(63, 210, 180, 0.35)',
        textColor: 'rgba(233, 251, 244, 0.88)',
        textColorHover: '#e9fbf4',
        textColorPressed: '#c5efe0',
        color: '#194638',
        colorHover: '#1e5443',
        colorPressed: '#184638',
        border: '1px solid rgba(63, 210, 180, 0.28)',
        borderHover: '1px solid rgba(63, 210, 180, 0.4)',
        borderPressed: '1px solid rgba(63, 210, 180, 0.52)'
      },
      Input: {
        color: '#1d5240',
        colorDisabled: '#1a4a3a',
        colorFocus: '#205845',
        textColor: '#e9fbf4',
        textColorDisabled: 'rgba(233, 251, 244, 0.55)',
        placeholderColor: 'rgba(197, 239, 224, 0.7)',
        placeholderColorDisabled: 'rgba(197, 239, 224, 0.45)',
        iconColor: 'rgba(197, 239, 224, 0.75)',
        iconColorHover: '#c5efe0',
        iconColorPressed: '#e9fbf4',
        iconColorDisabled: 'rgba(197, 239, 224, 0.4)',
        clearColor: 'rgba(233, 251, 244, 0.6)',
        clearColorHover: 'rgba(233, 251, 244, 0.75)',
        clearColorPressed: 'rgba(233, 251, 244, 0.9)',
        border: '1px solid rgba(63, 210, 180, 0.32)',
        borderDisabled: '1px solid rgba(63, 210, 180, 0.18)',
        borderHover: '1px solid rgba(63, 210, 180, 0.45)',
        borderFocus: '1px solid #57e4c8',
        boxShadowFocus: '0 0 0 2px rgba(87, 228, 200, 0.16)',
        loadingColor: '#57e4c8',
        suffixTextColor: 'rgba(233, 251, 244, 0.8)',
        prefixTextColor: 'rgba(233, 251, 244, 0.8)'
      },
      Card: {
        color: '#174737',
        colorModal: '#174737',
        colorTarget: '#174737',
        textColor: '#e9fbf4',
        titleTextColor: '#def7ef',
        borderColor: 'rgba(63, 210, 180, 0.28)',
        actionColor: '#205845',
        closeIconColor: 'rgba(233, 251, 244, 0.7)',
        closeIconColorHover: '#c5efe0',
        closeIconColorPressed: '#e9fbf4',
        boxShadow: '0 18px 40px rgba(9, 32, 23, 0.45)'
      },
      Tabs: {
        tabColor: '#1b4f3d',
        tabColorActive: '#20614a',
        tabBorderColor: 'rgba(63, 210, 180, 0.32)',
        tabTextColorBar: 'rgba(233, 251, 244, 0.7)',
        tabTextColorBarHover: '#c5efe0',
        tabTextColorBarActive: '#e9fbf4',
        tabTextColorCard: 'rgba(233, 251, 244, 0.7)',
        tabTextColorCardActive: '#e9fbf4',
        barColor: 'rgba(63, 210, 180, 0.6)'
      },
      Radio: {
        buttonBorderColor: 'rgba(63, 210, 180, 0.32)',
        buttonBorderColorActive: 'rgba(87, 228, 200, 0.6)',
        buttonColor: '#1b4f3d',
        buttonColorActive: '#20614a',
        buttonTextColor: 'rgba(233, 251, 244, 0.7)',
        buttonTextColorActive: '#e9fbf4'
      },
      Dropdown: {
        color: '#174737',
        optionTextColor: '#e9fbf4',
        optionTextColorHover: '#c5efe0',
        optionTextColorActive: '#0f342b',
        optionColorHover: '#1f5f49',
        optionColorActive: '#236b52',
        borderColor: 'rgba(63, 210, 180, 0.32)'
      }
    }
  },

  purple: {
    id: 'purple',
    labelKey: 'theme.purple',
    naiveTheme: darkTheme,
    themeOverrides: {
      common: {
        primaryColor: '#b47bff',
        primaryColorHover: '#a060f7',
        primaryColorPressed: '#8c4edf',
        primaryColorSuppl: '#d6c3ff',
        bodyColor: '#1f1633',
        cardColor: '#2a1f45',
        modalColor: '#2a1f45',
        popoverColor: '#2a1f45',
        tableColor: '#31255a',
        tableHeaderColor: '#3b2d6a',
        inputColor: '#342964',
        codeColor: '#3b2d6a',
        tabColor: '#3b2d6a',
        actionColor: '#3b2d6a',
        textColorBase: '#f5ecff',
        textColor1: 'rgba(245, 236, 255, 0.94)',
        textColor2: 'rgba(245, 236, 255, 0.78)',
        textColor3: 'rgba(245, 236, 255, 0.58)',
        textColorDisabled: 'rgba(245, 236, 255, 0.38)',
        placeholderColor: 'rgba(214, 193, 255, 0.7)',
        placeholderColorDisabled: 'rgba(214, 193, 255, 0.45)',
        iconColor: 'rgba(225, 210, 255, 0.7)',
        iconColorHover: 'rgba(225, 210, 255, 0.85)',
        iconColorPressed: '#f5ecff',
        iconColorDisabled: 'rgba(225, 210, 255, 0.45)',
        borderColor: 'rgba(147, 111, 214, 0.35)',
        dividerColor: 'rgba(147, 111, 214, 0.2)',
        scrollbarColor: 'rgba(127, 85, 194, 0.35)',
        scrollbarColorHover: 'rgba(127, 85, 194, 0.55)',
        closeIconColor: 'rgba(225, 210, 255, 0.7)',
        closeIconColorHover: '#e1d2ff',
        closeIconColorPressed: '#f5ecff',
        clearColor: 'rgba(225, 210, 255, 0.6)',
        clearColorHover: 'rgba(225, 210, 255, 0.75)',
        clearColorPressed: 'rgba(225, 210, 255, 0.9)',
        successColor: '#5be0a2',
        successColorHover: '#41c488',
        successColorPressed: '#329a6a',
        successColorSuppl: '#1c4b35',
        errorColor: '#ff7aa2',
        errorColorHover: '#f25c87',
        errorColorPressed: '#c1426a',
        errorColorSuppl: '#4b1f32'
      },
      Button: {
        textColorPrimary: '#1f1633',
        textColorHoverPrimary: '#1a122c',
        textColorPressedPrimary: '#140d22',
        textColorFocusPrimary: '#1f1633',
        textColorDisabledPrimary: 'rgba(31, 22, 51, 0.82)',
        colorPrimary: '#c9a5ff',
        colorHoverPrimary: '#b98bff',
        colorPressedPrimary: '#a069f3',
        colorFocusPrimary: '#c9a5ff',
        colorDisabledPrimary: '#7056b0',
        borderPrimary: '1px solid #b98bff',
        borderHoverPrimary: '1px solid #a069f3',
        borderPressedPrimary: '1px solid #8a56db',
        borderFocusPrimary: '1px solid #b98bff',
        borderDisabledPrimary: '1px solid rgba(185, 139, 255, 0.35)',
        rippleColorPrimary: 'rgba(185, 139, 255, 0.35)',
        textColor: 'rgba(245, 236, 255, 0.88)',
        textColorHover: '#f5ecff',
        textColorPressed: '#d6c3ff',
        color: '#2d204b',
        colorHover: '#36275a',
        colorPressed: '#402d6c',
        border: '1px solid rgba(147, 111, 214, 0.3)',
        borderHover: '1px solid rgba(147, 111, 214, 0.42)',
        borderPressed: '1px solid rgba(147, 111, 214, 0.55)'
      },
      Input: {
        color: '#342964',
        colorDisabled: '#2f245a',
        colorFocus: '#392c6c',
        textColor: '#f5ecff',
        textColorDisabled: 'rgba(245, 236, 255, 0.58)',
        placeholderColor: 'rgba(214, 193, 255, 0.7)',
        placeholderColorDisabled: 'rgba(214, 193, 255, 0.45)',
        iconColor: 'rgba(214, 193, 255, 0.75)',
        iconColorHover: '#d6c3ff',
        iconColorPressed: '#f5ecff',
        iconColorDisabled: 'rgba(214, 193, 255, 0.4)',
        clearColor: 'rgba(225, 210, 255, 0.6)',
        clearColorHover: 'rgba(225, 210, 255, 0.75)',
        clearColorPressed: 'rgba(225, 210, 255, 0.9)',
        border: '1px solid rgba(147, 111, 214, 0.35)',
        borderDisabled: '1px solid rgba(147, 111, 214, 0.2)',
        borderHover: '1px solid rgba(169, 129, 229, 0.45)',
        borderFocus: '1px solid #b47bff',
        boxShadowFocus: '0 0 0 2px rgba(180, 123, 255, 0.2)',
        loadingColor: '#b47bff',
        suffixTextColor: 'rgba(245, 236, 255, 0.78)',
        prefixTextColor: 'rgba(245, 236, 255, 0.78)'
      },
      Card: {
        color: '#2a1f45',
        colorModal: '#2a1f45',
        colorTarget: '#2a1f45',
        textColor: '#f5ecff',
        titleTextColor: '#fdf7ff',
        borderColor: 'rgba(147, 111, 214, 0.35)',
        actionColor: '#342964',
        closeIconColor: 'rgba(225, 210, 255, 0.7)',
        closeIconColorHover: '#d6c3ff',
        closeIconColorPressed: '#f5ecff',
        boxShadow: '0 18px 42px rgba(16, 8, 29, 0.45)'
      },
      Tabs: {
        tabColor: '#342964',
        tabColorActive: '#3f3277',
        tabBorderColor: 'rgba(147, 111, 214, 0.35)',
        tabTextColorBar: 'rgba(245, 236, 255, 0.75)',
        tabTextColorBarHover: '#e1d2ff',
        tabTextColorBarActive: '#f5ecff',
        tabTextColorCard: 'rgba(245, 236, 255, 0.75)',
        tabTextColorCardActive: '#f5ecff',
        barColor: 'rgba(180, 123, 255, 0.6)'
      },
      Radio: {
        buttonBorderColor: 'rgba(147, 111, 214, 0.35)',
        buttonBorderColorActive: 'rgba(180, 123, 255, 0.55)',
        buttonColor: '#342964',
        buttonColorActive: '#403277',
        buttonTextColor: 'rgba(245, 236, 255, 0.78)',
        buttonTextColorActive: '#fdf7ff'
      },
      Dropdown: {
        color: '#2a1f45',
        optionTextColor: '#f5ecff',
        optionTextColorHover: '#e1d2ff',
        optionTextColorActive: '#1f1633',
        optionColorHover: '#36275a',
        optionColorActive: '#42317a',
        borderColor: 'rgba(147, 111, 214, 0.35)'
      }
    }
  }
}

// 获取可用主题列表
export const availableThemes = Object.values(naiveThemeConfigs)

// 当前主题配置
export const currentThemeConfig = computed(() => 
  naiveThemeConfigs[currentThemeId.value] || naiveThemeConfigs.light
)

// 当前 Naive UI 主题
export const currentNaiveTheme = computed<GlobalTheme | null>(() => 
  currentThemeConfig.value.naiveTheme
)

// 当前主题覆盖配置
export const currentThemeOverrides = computed<GlobalThemeOverrides>(() => 
  currentThemeConfig.value.themeOverrides || {}
)

// legacy 主题收敛（docs/ui-redesign-design.md §1.2 决策）：
// blue/classic/green/purple 配置保留（兼容 switchTheme API 与持久化偏好），
// 但实际应用时映射到 light/dark，主题 UI 只展示 light/dark/auto。
const LEGACY_THEME_MAP: Record<string, string> = {
  blue: 'light',
  classic: 'light',
  green: 'dark',
  purple: 'dark',
}

const resolveAppliedThemeId = (selectedThemeId: string): string => {
  if (selectedThemeId === 'auto') {
    try {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  }
  return LEGACY_THEME_MAP[selectedThemeId] ?? selectedThemeId
}

const applyThemeId = (selectedThemeId: string): boolean => {
  const applied = resolveAppliedThemeId(selectedThemeId)
  if (!naiveThemeConfigs[applied]) {
    console.warn(`Theme '${applied}' not found`)
    return false
  }
  currentThemeId.value = applied

  // Keep Tailwind's `dark:` variant in sync with the app theme.
  // Tailwind in this repo uses `darkMode: 'class'`, so we must toggle `.dark`.
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      const isDark = naiveThemeConfigs[applied]?.naiveTheme === darkTheme
      document.documentElement.classList.toggle('dark', Boolean(isDark))
      // Drive native light-dark() tokens (styles/tokens.css) via color-scheme.
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
      document.documentElement.classList.toggle('color-scheme-dark', Boolean(isDark))
      document.documentElement.classList.toggle('color-scheme-light', !isDark)
    }
  } catch (error) {
    // Best-effort only; theme switching must not break if DOM is unavailable.
    console.warn('[Theme] Failed to sync Tailwind dark class:', error)
  }
  return true
}

type MediaQueryListCompat = MediaQueryList & {
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void
}

let __autoColorSchemeWatchInitialized = false
let __autoColorSchemeQuery: MediaQueryListCompat | null = null
let __autoColorSchemeListener: ((e: MediaQueryListEvent) => void) | null = null

const cleanupAutoColorSchemeWatch = (): void => {
  try {
    const query = __autoColorSchemeQuery
    const listener = __autoColorSchemeListener
    if (!query || !listener) return

    if (typeof query.removeEventListener === 'function') {
      query.removeEventListener('change', listener)
    } else if (typeof query.removeListener === 'function') {
      query.removeListener(listener)
    }
  } catch (error) {
    console.warn('[Theme] Failed to cleanup prefers-color-scheme watcher:', error)
  } finally {
    __autoColorSchemeQuery = null
    __autoColorSchemeListener = null
    __autoColorSchemeWatchInitialized = false
  }
}

const ensureAutoColorSchemeWatch = (settings: ReturnType<typeof useGlobalSettings>): void => {
  // Only relevant when the user-selected theme is 'auto'.
  if (__autoColorSchemeWatchInitialized) return
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

  try {
    const query = window.matchMedia('(prefers-color-scheme: dark)') as MediaQueryListCompat
    const listener = (_e: MediaQueryListEvent) => {
      if (settings.state.selectedThemeId !== 'auto') return
      applyThemeId('auto')
    }

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', listener)
    } else if (typeof query.addListener === 'function') {
      query.addListener(listener)
    }

    // Keep refs so we can clean up on HMR dispose.
    __autoColorSchemeQuery = query
    __autoColorSchemeListener = listener

    // Dev-only: avoid accumulating listeners across Vite HMR reloads.
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        cleanupAutoColorSchemeWatch()
      })
    }

    __autoColorSchemeWatchInitialized = true
  } catch (error) {
    console.warn('[Theme] Failed to init prefers-color-scheme watcher:', error)
  }
}

// 主题切换（统一由 useGlobalSettings 持久化）
export const switchTheme = (themeId: string): boolean => {
  const settings = useGlobalSettings(pinia)
  settings.updateThemeId(themeId)

  const ok = applyThemeId(themeId)
  if (ok) {
    console.log(`Pure Naive UI theme switched to: ${themeId}`)
  }
  return ok
}

// 获取当前主题ID
export const getCurrentThemeId = (): string => currentThemeId.value

// 获取主题配置
export const getThemeConfig = (themeId: string): ThemeConfig | null => {
  return naiveThemeConfigs[themeId] || null
}

// 初始化主题系统
export const initializeNaiveTheme = (): void => {
  const settings = useGlobalSettings(pinia)

  // 一次性迁移：localStorage('naive-theme-id') → useGlobalSettings
  // 只在 global-settings/v1 尚未恢复且当前为默认 'auto' 时执行
  try {
    const legacy = localStorage.getItem('naive-theme-id')
    if (legacy && settings.state.selectedThemeId === 'auto' && !settings.hasRestored) {
      settings.updateThemeId(legacy)
    }
  } catch (error) {
    console.warn('Failed to load legacy theme preference:', error)
  }

  // When in 'auto' mode, keep theme synced with OS color scheme changes.
  ensureAutoColorSchemeWatch(settings)

  // 监听全局配置的主题选择，驱动实际应用主题
  // 使用模块级 guard，防止 initializeNaiveTheme 被多次调用时重复注册 watch
  if (!__themeWatchInitialized) {
    __themeWatchInitialized = true
    watch(
      () => settings.state.selectedThemeId,
      (selectedId) => {
        if (!selectedId) return
        applyThemeId(selectedId)
      },
      { immediate: true }
    )
  } else {
    // 已注册 watch：手动应用一次，确保初始化时 theme 与 state 对齐
    applyThemeId(settings.state.selectedThemeId)
  }
}

let __themeWatchInitialized = false

// 检查是否为深色主题
export const isDarkTheme = computed(() => {
  const config = currentThemeConfig.value
  return config.naiveTheme === darkTheme
})

// 为向后兼容性导出的别名
export const naiveTheme = currentNaiveTheme
export const themeOverrides = currentThemeOverrides
