/**
 * 默认模板统一导入
 * 
 * 🎯 极简设计：模板自身包含完整信息，无需额外配置
 */

// 导入所有模板
import { template as general_optimize } from './optimize/general-optimize';
import { template as general_optimize_en } from './optimize/general-optimize_en';
import { template as output_format_optimize } from './optimize/output-format-optimize';
import { template as output_format_optimize_en } from './optimize/output-format-optimize_en';
import { template as analytical_optimize } from './optimize/analytical-optimize';
import { template as analytical_optimize_en } from './optimize/analytical-optimize_en';
import { template as soul_openclaw_compose } from './optimize/soul-openclaw-compose';
import { template as soul_openclaw_compose_en } from './optimize/soul-openclaw-compose_en';
import { template as soul_hermes_compose } from './optimize/soul-hermes-compose';
import { template as soul_hermes_compose_en } from './optimize/soul-hermes-compose_en';
// 任务→提示词生成器（中/英）：从任务要求直接产出完整提示词
import { template as task_to_prompt } from './optimize/task-to-prompt';
import { template as task_to_prompt_en } from './optimize/task-to-prompt_en';
// 场景化生成器模板（中/英）：文案/编程/教学/客服/数据/翻译/图像/视频
import { template as task_to_prompt_copywriting } from './optimize/task-to-prompt-copywriting';
import { template as task_to_prompt_copywriting_en } from './optimize/task-to-prompt-copywriting_en';
import { template as task_to_prompt_coding } from './optimize/task-to-prompt-coding';
import { template as task_to_prompt_coding_en } from './optimize/task-to-prompt-coding_en';
import { template as task_to_prompt_teaching } from './optimize/task-to-prompt-teaching';
import { template as task_to_prompt_teaching_en } from './optimize/task-to-prompt-teaching_en';
import { template as task_to_prompt_service } from './optimize/task-to-prompt-service';
import { template as task_to_prompt_service_en } from './optimize/task-to-prompt-service_en';
import { template as task_to_prompt_data } from './optimize/task-to-prompt-data';
import { template as task_to_prompt_data_en } from './optimize/task-to-prompt-data_en';
import { template as task_to_prompt_translation } from './optimize/task-to-prompt-translation';
import { template as task_to_prompt_translation_en } from './optimize/task-to-prompt-translation_en';
// 场景化生成器模板 - 图像/视频（挂载 text2imageOptimize / text2videoOptimize）
import { template as task_to_prompt_image } from './optimize/task-to-prompt-image';
import { template as task_to_prompt_image_en } from './optimize/task-to-prompt-image_en';
import { template as task_to_prompt_video } from './optimize/task-to-prompt-video';
import { template as task_to_prompt_video_en } from './optimize/task-to-prompt-video_en';
// 通用编程领域优化模板（中/英）
import { template as code_review_optimize } from './optimize/programming/code-review-optimize';
import { template as code_review_optimize_en } from './optimize/programming/code-review-optimize_en';
import { template as refactor_suggest_optimize } from './optimize/programming/refactor-suggest-optimize';
import { template as refactor_suggest_optimize_en } from './optimize/programming/refactor-suggest-optimize_en';
import { template as algorithm_explain_optimize } from './optimize/programming/algorithm-explain-optimize';
import { template as algorithm_explain_optimize_en } from './optimize/programming/algorithm-explain-optimize_en';
import { template as error_diagnosis_optimize } from './optimize/programming/error-diagnosis-optimize';
import { template as error_diagnosis_optimize_en } from './optimize/programming/error-diagnosis-optimize_en';
import { template as context_iterate } from './iterate/context/context-iterate';
import { template as context_iterate_en } from './iterate/context/context-iterate_en';
// 上下文消息优化模板（多轮对话模式专用）- 通用模板优先
import { template as context_message_optimize } from './optimize/context/context-message-optimize';
import { template as context_message_optimize_en } from './optimize/context/context-message-optimize_en';
// 上下文消息优化模板：多轮引导/上下文压缩（中/英）
import { template as context_message_multiturn_guide } from './optimize/context/context-message-multiturn-guide';
import { template as context_message_multiturn_guide_en } from './optimize/context/context-message-multiturn-guide_en';
import { template as context_message_compress } from './optimize/context/context-message-compress';
import { template as context_message_compress_en } from './optimize/context/context-message-compress_en';
// 上下文消息优化模板：分析型/输出格式（中/英）
import { template as context_analytical_optimize } from './optimize/context/context-analytical-optimize';
import { template as context_analytical_optimize_en } from './optimize/context/context-analytical-optimize_en';
import { template as context_output_format_optimize } from './optimize/context/context-output-format-optimize';
import { template as context_output_format_optimize_en } from './optimize/context/context-output-format-optimize_en';
// 新增对齐的用户上下文模板（基础/专业/规划）（中/英）
import { template as context_user_prompt_basic } from './user-optimize/context/context-user-prompt-basic';
import { template as context_user_prompt_basic_en } from './user-optimize/context/context-user-prompt-basic_en';
import { template as context_user_prompt_professional_ctx } from './user-optimize/context/context-user-prompt-professional';
import { template as context_user_prompt_professional_ctx_en } from './user-optimize/context/context-user-prompt-professional_en';
import { template as context_user_prompt_planning_ctx } from './user-optimize/context/context-user-prompt-planning';
import { template as context_user_prompt_planning_ctx_en } from './user-optimize/context/context-user-prompt-planning_en';
// 上下文用户提示词优化：纠正反馈（中/英）
import { template as context_user_correction } from './user-optimize/context/context-user-correction';
import { template as context_user_correction_en } from './user-optimize/context/context-user-correction_en';
// 上下文迭代：按反馈迭代（中/英）
import { template as context_iterate_feedback } from './iterate/context/context-iterate-feedback';
import { template as context_iterate_feedback_en } from './iterate/context/context-iterate-feedback_en';

import { template as iterate } from './iterate/iterate';
import { template as iterate_en } from './iterate/iterate_en';
import { template as soul_iterate } from './iterate/soul-iterate';
import { template as soul_iterate_en } from './iterate/soul-iterate_en';
// 迭代优化：按反馈/细节增强/精简压缩（中/英）
import { template as iterate_feedback } from './iterate/iterate-feedback';
import { template as iterate_feedback_en } from './iterate/iterate-feedback_en';
import { template as iterate_enhance } from './iterate/iterate-enhance';
import { template as iterate_enhance_en } from './iterate/iterate-enhance_en';
import { template as iterate_simplify } from './iterate/iterate-simplify';
import { template as iterate_simplify_en } from './iterate/iterate-simplify_en';

import { user_prompt_professional } from './user-optimize/user-prompt-professional';
import { user_prompt_professional_en } from './user-optimize/user-prompt-professional_en';
import { user_prompt_basic } from './user-optimize/user-prompt-basic';
import { user_prompt_basic_en } from './user-optimize/user-prompt-basic_en';
import { user_prompt_planning } from './user-optimize/user-prompt-planning';
import { user_prompt_planning_en } from './user-optimize/user-prompt-planning_en';
// 用户提示词优化：任务指令/多约束复杂任务/角色扮演（中/英）
import { template as user_prompt_task_instruction } from './user-optimize/user-prompt-task-instruction';
import { template as user_prompt_task_instruction_en } from './user-optimize/user-prompt-task-instruction_en';
import { template as user_prompt_multi_constraint } from './user-optimize/user-prompt-multi-constraint';
import { template as user_prompt_multi_constraint_en } from './user-optimize/user-prompt-multi-constraint_en';
import { template as user_prompt_roleplay } from './user-optimize/user-prompt-roleplay';
import { template as user_prompt_roleplay_en } from './user-optimize/user-prompt-roleplay_en';

// 图像优化模板（重构后的目录结构）
// 文生图
import { template as image_general_optimize } from './image-optimize/text2image/general-image-optimize';
import { template as image_general_optimize_en } from './image-optimize/text2image/general-image-optimize_en';
import { template as image_chinese_optimize } from './image-optimize/text2image/chinese-model-optimize';
import { template as image_chinese_optimize_en } from './image-optimize/text2image/chinese-model-optimize_en';
import { template as image_photography_optimize } from './image-optimize/text2image/photography-optimize';
import { template as image_photography_optimize_en } from './image-optimize/text2image/photography-optimize_en';
import { template as image_creative_text2image } from './image-optimize/text2image/creative-text2image';
import { template as image_creative_text2image_en } from './image-optimize/text2image/creative-text2image_en';
import { template as image_json_structured_optimize } from './image-optimize/text2image/json-structured-optimize';
import { template as image_json_structured_optimize_en } from './image-optimize/text2image/json-structured-optimize_en';
// 文生图场景化：人物写真/电商产品图/插画动漫（中/英）
import { template as image_portrait_optimize } from './image-optimize/text2image/image-portrait-optimize';
import { template as image_portrait_optimize_en } from './image-optimize/text2image/image-portrait-optimize_en';
import { template as image_ecommerce_optimize } from './image-optimize/text2image/image-ecommerce-optimize';
import { template as image_ecommerce_optimize_en } from './image-optimize/text2image/image-ecommerce-optimize_en';
import { template as image_illustration_optimize } from './image-optimize/text2image/image-illustration-optimize';
import { template as image_illustration_optimize_en } from './image-optimize/text2image/image-illustration-optimize_en';
// 图生图
import { template as image2image_optimize } from './image-optimize/image2image/image2image-optimize';
import { template as image2image_optimize_en } from './image-optimize/image2image/image2image-optimize_en';
import { template as image2image_design_text_edit_optimize } from './image-optimize/image2image/design-text-edit-optimize';
import { template as image2image_design_text_edit_optimize_en } from './image-optimize/image2image/design-text-edit-optimize_en';
import { template as image2image_json_structured_optimize } from './image-optimize/image2image/json-structured-optimize';
import { template as image2image_json_structured_optimize_en } from './image-optimize/image2image/json-structured-optimize_en';
// 图生图场景化：风格迁移/局部编辑/换装造型（中/英）
import { template as image2image_style_transfer } from './image-optimize/image2image/image2image-style-transfer';
import { template as image2image_style_transfer_en } from './image-optimize/image2image/image2image-style-transfer_en';
import { template as image2image_local_edit } from './image-optimize/image2image/image2image-local-edit';
import { template as image2image_local_edit_en } from './image-optimize/image2image/image2image-local-edit_en';
import { template as image2image_outfit } from './image-optimize/image2image/image2image-outfit';
import { template as image2image_outfit_en } from './image-optimize/image2image/image2image-outfit_en';
// 多图生图
import { template as multiimage_optimize } from './image-optimize/multiimage/multiimage-optimize';
import { template as multiimage_optimize_en } from './image-optimize/multiimage/multiimage-optimize_en';
// 图像迭代
import { template as image_iterate_general } from './image-optimize/iterate/image-iterate-general';
import { template as image_iterate_general_en } from './image-optimize/iterate/image-iterate-general_en';
// 图像迭代：按反馈微调/风格强化（中/英）
import { template as image_iterate_feedback } from './image-optimize/iterate/image-iterate-feedback';
import { template as image_iterate_feedback_en } from './image-optimize/iterate/image-iterate-feedback_en';
import { template as image_iterate_style_boost } from './image-optimize/iterate/image-iterate-style-boost';
import { template as image_iterate_style_boost_en } from './image-optimize/iterate/image-iterate-style-boost_en';

// 视频优化模板
import { template as video_general_optimize } from './video-optimize/text2video/general-video-optimize';
import { template as video_general_optimize_en } from './video-optimize/text2video/general-video-optimize_en';
import { template as video_image_optimize } from './video-optimize/image2video/general-video-image-optimize';
import { template as video_image_optimize_en } from './video-optimize/image2video/general-video-image-optimize_en';
// 文生视频场景化：产品广告/人物叙事/风景旅拍（中/英）
import { template as video_product_ad } from './video-optimize/text2video/video-product-ad';
import { template as video_product_ad_en } from './video-optimize/text2video/video-product-ad_en';
import { template as video_narrative } from './video-optimize/text2video/video-narrative';
import { template as video_narrative_en } from './video-optimize/text2video/video-narrative_en';
import { template as video_travel } from './video-optimize/text2video/video-travel';
import { template as video_travel_en } from './video-optimize/text2video/video-travel_en';
// 图生视频场景化：人物微动/场景运镜/产品旋转（中/英）
import { template as video_image_portrait_motion } from './video-optimize/image2video/video-image-portrait-motion';
import { template as video_image_portrait_motion_en } from './video-optimize/image2video/video-image-portrait-motion_en';
import { template as video_image_camera_move } from './video-optimize/image2video/video-image-camera-move';
import { template as video_image_camera_move_en } from './video-optimize/image2video/video-image-camera-move_en';
import { template as video_image_product_spin } from './video-optimize/image2video/video-image-product-spin';
import { template as video_image_product_spin_en } from './video-optimize/image2video/video-image-product-spin_en';

// 评估模板 - 基础模式/系统提示词
import { template as evaluation_basic_system_result } from './evaluation/basic/system/evaluation-result';
import { template as evaluation_basic_system_result_en } from './evaluation/basic/system/evaluation-result_en';
import { template as evaluation_basic_system_compare } from './evaluation/basic/system/evaluation-compare';
import { template as evaluation_basic_system_compare_en } from './evaluation/basic/system/evaluation-compare_en';
// 评估模板 - 基础模式/用户提示词
import { template as evaluation_basic_user_result } from './evaluation/basic/user/evaluation-result';
import { template as evaluation_basic_user_result_en } from './evaluation/basic/user/evaluation-result_en';
import { template as evaluation_basic_user_compare } from './evaluation/basic/user/evaluation-compare';
import { template as evaluation_basic_user_compare_en } from './evaluation/basic/user/evaluation-compare_en';
// 评估模板 - 高级模式/系统提示词（多消息模式）
import { template as evaluation_pro_system_result } from './evaluation/pro/system/evaluation-result';
import { template as evaluation_pro_system_result_en } from './evaluation/pro/system/evaluation-result_en';
import { template as evaluation_pro_system_compare } from './evaluation/pro/system/evaluation-compare';
import { template as evaluation_pro_system_compare_en } from './evaluation/pro/system/evaluation-compare_en';
// 评估模板 - 高级模式/用户提示词（变量模式）
import { template as evaluation_pro_user_result } from './evaluation/pro/user/evaluation-result';
import { template as evaluation_pro_user_result_en } from './evaluation/pro/user/evaluation-result_en';
import { template as evaluation_pro_user_compare } from './evaluation/pro/user/evaluation-compare';
import { template as evaluation_pro_user_compare_en } from './evaluation/pro/user/evaluation-compare_en';
// 评估模板 - 仅提示词评估（无需测试结果）
import { template as evaluation_basic_system_prompt_only } from './evaluation/basic/system/evaluation-prompt-only';
import { template as evaluation_basic_system_prompt_only_en } from './evaluation/basic/system/evaluation-prompt-only_en';
import { template as evaluation_basic_system_prompt_iterate } from './evaluation/basic/system/evaluation-prompt-iterate';
import { template as evaluation_basic_system_prompt_iterate_en } from './evaluation/basic/system/evaluation-prompt-iterate_en';
import { template as evaluation_basic_user_prompt_only } from './evaluation/basic/user/evaluation-prompt-only';
import { template as evaluation_basic_user_prompt_only_en } from './evaluation/basic/user/evaluation-prompt-only_en';
import { template as evaluation_basic_user_prompt_iterate } from './evaluation/basic/user/evaluation-prompt-iterate';
import { template as evaluation_basic_user_prompt_iterate_en } from './evaluation/basic/user/evaluation-prompt-iterate_en';
import { template as evaluation_pro_system_prompt_only } from './evaluation/pro/system/evaluation-prompt-only';
import { template as evaluation_pro_system_prompt_only_en } from './evaluation/pro/system/evaluation-prompt-only_en';
import { template as evaluation_pro_system_prompt_iterate } from './evaluation/pro/system/evaluation-prompt-iterate';
import { template as evaluation_pro_system_prompt_iterate_en } from './evaluation/pro/system/evaluation-prompt-iterate_en';
import { template as evaluation_pro_user_prompt_only } from './evaluation/pro/user/evaluation-prompt-only';
import { template as evaluation_pro_user_prompt_only_en } from './evaluation/pro/user/evaluation-prompt-only_en';
import { template as evaluation_pro_user_prompt_iterate } from './evaluation/pro/user/evaluation-prompt-iterate';
import { template as evaluation_pro_user_prompt_iterate_en } from './evaluation/pro/user/evaluation-prompt-iterate_en';
// 评估模板 - 图像模式/文生图
import { template as evaluation_image_text2image_prompt_only } from './evaluation/image/text2image/evaluation-prompt-only';
import { template as evaluation_image_text2image_prompt_only_en } from './evaluation/image/text2image/evaluation-prompt-only_en';
import { template as evaluation_image_text2image_prompt_iterate } from './evaluation/image/text2image/evaluation-prompt-iterate';
import { template as evaluation_image_text2image_prompt_iterate_en } from './evaluation/image/text2image/evaluation-prompt-iterate_en';
import { template as evaluation_image_text2image_result } from './evaluation/image/text2image/evaluation-result';
import { template as evaluation_image_text2image_result_en } from './evaluation/image/text2image/evaluation-result_en';
import { template as evaluation_image_text2image_compare } from './evaluation/image/text2image/evaluation-compare';
import { template as evaluation_image_text2image_compare_en } from './evaluation/image/text2image/evaluation-compare_en';
// 评估模板 - 图像模式/图生图
import { template as evaluation_image_image2image_prompt_only } from './evaluation/image/image2image/evaluation-prompt-only';
import { template as evaluation_image_image2image_prompt_only_en } from './evaluation/image/image2image/evaluation-prompt-only_en';
// 评估模板 - 图像模式/多图生图
import { template as evaluation_image_multiimage_prompt_only } from './evaluation/image/multiimage/evaluation-prompt-only';
import { template as evaluation_image_multiimage_prompt_only_en } from './evaluation/image/multiimage/evaluation-prompt-only_en';

// 变量提取模板
import { variableExtractionTemplate } from './variable-extraction';
import { variableExtractionTemplateEn } from './variable-extraction';

// 变量值生成模板
import { variableValueGenerationTemplate } from './variable-value-generation';
import { variableValueGenerationTemplateEn } from './variable-value-generation';
// 基于评估结果的智能改写模板
import { template as evaluation_rewrite_basic_system } from './evaluation-rewrite/basic-system';
import { template as evaluation_rewrite_basic_system_en } from './evaluation-rewrite/basic-system_en';
import { template as evaluation_rewrite_basic_user } from './evaluation-rewrite/basic-user';
import { template as evaluation_rewrite_basic_user_en } from './evaluation-rewrite/basic-user_en';
import { template as evaluation_rewrite_pro_multi } from './evaluation-rewrite/pro-multi';
import { template as evaluation_rewrite_pro_multi_en } from './evaluation-rewrite/pro-multi_en';
import { template as evaluation_rewrite_pro_variable } from './evaluation-rewrite/pro-variable';
import { template as evaluation_rewrite_pro_variable_en } from './evaluation-rewrite/pro-variable_en';
import { template as evaluation_rewrite_generic } from './evaluation-rewrite/generic';
import { template as evaluation_rewrite_generic_en } from './evaluation-rewrite/generic_en';
import { template as evaluation_structured_compare_pair_judge } from './evaluation-structured-compare/pair-judge';
import { template as evaluation_structured_compare_pair_judge_en } from './evaluation-structured-compare/pair-judge_en';
import { template as evaluation_structured_compare_synthesis } from './evaluation-structured-compare/synthesis';
import { template as evaluation_structured_compare_synthesis_en } from './evaluation-structured-compare/synthesis_en';

import { imagePromptCompositionTemplate } from './image-prompt-composition';
import { imagePromptCompositionTemplateEn } from './image-prompt-composition';
import { imagePromptMigrationTemplate } from './image-prompt-migration';
import { imagePromptMigrationTemplateEn } from './image-prompt-migration';

// 简单的模板集合 - 模板自身已包含完整信息（id、name、language、type等）
export const ALL_TEMPLATES = {
  general_optimize,
  general_optimize_en,
  output_format_optimize,
  output_format_optimize_en,
  analytical_optimize,
  analytical_optimize_en,
  soul_openclaw_compose,
  soul_openclaw_compose_en,
  soul_hermes_compose,
  soul_hermes_compose_en,
  // 任务→提示词生成器
  task_to_prompt,
  task_to_prompt_en,
  // 场景化生成器模板（中/英）— optimize 类，图像/视频版本注册在各自分组末尾
  task_to_prompt_copywriting,
  task_to_prompt_copywriting_en,
  task_to_prompt_coding,
  task_to_prompt_coding_en,
  task_to_prompt_teaching,
  task_to_prompt_teaching_en,
  task_to_prompt_service,
  task_to_prompt_service_en,
  task_to_prompt_data,
  task_to_prompt_data_en,
  task_to_prompt_translation,
  task_to_prompt_translation_en,
  // 通用编程领域优化模板
  code_review_optimize,
  code_review_optimize_en,
  refactor_suggest_optimize,
  refactor_suggest_optimize_en,
  algorithm_explain_optimize,
  algorithm_explain_optimize_en,
  error_diagnosis_optimize,
  error_diagnosis_optimize_en,
  context_iterate,
  context_iterate_en,
  // 上下文迭代：按反馈迭代（追加在组末尾，不顶替默认模板）
  context_iterate_feedback,
  context_iterate_feedback_en,
  context_message_optimize,
  context_message_optimize_en,
  context_analytical_optimize,
  context_analytical_optimize_en,
  context_output_format_optimize,
  context_output_format_optimize_en,
  // 上下文消息优化：多轮引导/上下文压缩（追加在组末尾，不顶替默认模板「通用消息优化」）
  context_message_multiturn_guide,
  context_message_multiturn_guide_en,
  context_message_compress,
  context_message_compress_en,
  context_user_prompt_basic,
  context_user_prompt_basic_en,
  context_user_prompt_professional_ctx,
  context_user_prompt_professional_ctx_en,
  context_user_prompt_planning_ctx,
  context_user_prompt_planning_ctx_en,
  // 上下文用户提示词优化：纠正反馈（追加在组末尾，不顶替默认模板「基础精炼」）
  context_user_correction,
  context_user_correction_en,
  user_prompt_professional,
  user_prompt_professional_en,
  iterate,
  iterate_en,
  soul_iterate,
  soul_iterate_en,
  // 迭代优化：按反馈/细节增强/精简压缩（追加在组末尾，不顶替默认模板「通用迭代」）
  iterate_feedback,
  iterate_feedback_en,
  iterate_enhance,
  iterate_enhance_en,
  iterate_simplify,
  iterate_simplify_en,
  user_prompt_basic,
  user_prompt_basic_en,
  user_prompt_planning,
  user_prompt_planning_en,
  // 用户提示词优化：任务指令/多约束复杂任务/角色扮演（追加在组末尾，不顶替默认模板「专业优化」）
  user_prompt_task_instruction,
  user_prompt_task_instruction_en,
  user_prompt_multi_constraint,
  user_prompt_multi_constraint_en,
  user_prompt_roleplay,
  user_prompt_roleplay_en,
  // 图像优化模板
  image_general_optimize,
  image_general_optimize_en,
  image_chinese_optimize,
  image_chinese_optimize_en,
  image_photography_optimize,
  image_photography_optimize_en,
  image_creative_text2image,
  image_creative_text2image_en,
  image_json_structured_optimize,
  image_json_structured_optimize_en,
  // 文生图场景化：人物写真/电商产品图/插画动漫（追加在组末尾，不顶替默认模板「通用自然语言优化」）
  image_portrait_optimize,
  image_portrait_optimize_en,
  image_ecommerce_optimize,
  image_ecommerce_optimize_en,
  image_illustration_optimize,
  image_illustration_optimize_en,
  // 图生图模板
  image2image_optimize,
  image2image_optimize_en,
  image2image_design_text_edit_optimize,
  image2image_design_text_edit_optimize_en,
  image2image_json_structured_optimize,
  image2image_json_structured_optimize_en,
  // 图生图场景化：风格迁移/局部编辑/换装造型（追加在组末尾，不顶替默认模板「通用编辑优化」）
  image2image_style_transfer,
  image2image_style_transfer_en,
  image2image_local_edit,
  image2image_local_edit_en,
  image2image_outfit,
  image2image_outfit_en,
  multiimage_optimize,
  multiimage_optimize_en,
  // 图像迭代模板
  image_iterate_general,
  image_iterate_general_en,
  // 图像迭代：按反馈微调/风格强化（追加在组末尾，不顶替默认模板「通用迭代」）
  image_iterate_feedback,
  image_iterate_feedback_en,
  image_iterate_style_boost,
  image_iterate_style_boost_en,
  // 场景化生成器模板 - 图像（位于分组末尾，避免顶替默认模板「通用自然语言优化」）
  task_to_prompt_image,
  task_to_prompt_image_en,
  // 视频优化模板 - 文生视频
  video_general_optimize,
  video_general_optimize_en,
  // 视频优化模板 - 图生视频
  video_image_optimize,
  video_image_optimize_en,
  // 图生视频场景化：人物微动/场景运镜/产品旋转（追加在组末尾，不顶替默认模板「通用图生视频优化」）
  video_image_portrait_motion,
  video_image_portrait_motion_en,
  video_image_camera_move,
  video_image_camera_move_en,
  video_image_product_spin,
  video_image_product_spin_en,
  // 场景化生成器模板 - 视频（位于分组末尾，避免顶替默认模板「通用文生视频优化」）
  task_to_prompt_video,
  task_to_prompt_video_en,
  // 文生视频场景化：产品广告/人物叙事/风景旅拍（追加在组末尾，不顶替默认模板「通用文生视频优化」）
  video_product_ad,
  video_product_ad_en,
  video_narrative,
  video_narrative_en,
  video_travel,
  video_travel_en,
  // 评估模板 - 基础模式/系统提示词
  evaluation_basic_system_result,
  evaluation_basic_system_result_en,
  evaluation_basic_system_compare,
  evaluation_basic_system_compare_en,
  // 评估模板 - 基础模式/用户提示词
  evaluation_basic_user_result,
  evaluation_basic_user_result_en,
  evaluation_basic_user_compare,
  evaluation_basic_user_compare_en,
  // 评估模板 - 高级模式/系统提示词（多消息模式）
  evaluation_pro_system_result,
  evaluation_pro_system_result_en,
  evaluation_pro_system_compare,
  evaluation_pro_system_compare_en,
  // 评估模板 - 高级模式/用户提示词（变量模式）
  evaluation_pro_user_result,
  evaluation_pro_user_result_en,
  evaluation_pro_user_compare,
  evaluation_pro_user_compare_en,
  // 评估模板 - 仅提示词评估（无需测试结果）
  evaluation_basic_system_prompt_only,
  evaluation_basic_system_prompt_only_en,
  evaluation_basic_system_prompt_iterate,
  evaluation_basic_system_prompt_iterate_en,
  evaluation_basic_user_prompt_only,
  evaluation_basic_user_prompt_only_en,
  evaluation_basic_user_prompt_iterate,
  evaluation_basic_user_prompt_iterate_en,
  evaluation_pro_system_prompt_only,
  evaluation_pro_system_prompt_only_en,
  evaluation_pro_system_prompt_iterate,
  evaluation_pro_system_prompt_iterate_en,
  evaluation_pro_user_prompt_only,
  evaluation_pro_user_prompt_only_en,
  evaluation_pro_user_prompt_iterate,
  evaluation_pro_user_prompt_iterate_en,
  // 评估模板 - 图像模式/文生图
  evaluation_image_text2image_prompt_only,
  evaluation_image_text2image_prompt_only_en,
  evaluation_image_text2image_prompt_iterate,
  evaluation_image_text2image_prompt_iterate_en,
  evaluation_image_text2image_result,
  evaluation_image_text2image_result_en,
  evaluation_image_text2image_compare,
  evaluation_image_text2image_compare_en,
  // 评估模板 - 图像模式/图生图
  evaluation_image_image2image_prompt_only,
  evaluation_image_image2image_prompt_only_en,
  // 评估模板 - 图像模式/多图生图
  evaluation_image_multiimage_prompt_only,
  evaluation_image_multiimage_prompt_only_en,
  // 变量提取模板
  variableExtractionTemplate,
  variableExtractionTemplateEn,
  // 变量值生成模板
  variableValueGenerationTemplate,
  variableValueGenerationTemplateEn,
  // 基于评估结果的智能改写模板
  evaluation_rewrite_basic_system,
  evaluation_rewrite_basic_system_en,
  evaluation_rewrite_basic_user,
  evaluation_rewrite_basic_user_en,
  evaluation_rewrite_pro_multi,
  evaluation_rewrite_pro_multi_en,
  evaluation_rewrite_pro_variable,
  evaluation_rewrite_pro_variable_en,
  evaluation_rewrite_generic,
  evaluation_rewrite_generic_en,
  evaluation_structured_compare_pair_judge,
  evaluation_structured_compare_pair_judge_en,
  evaluation_structured_compare_synthesis,
  evaluation_structured_compare_synthesis_en,
  // 参考图内部模板
  imagePromptCompositionTemplate,
  imagePromptCompositionTemplateEn,
  imagePromptMigrationTemplate,
  imagePromptMigrationTemplateEn,
};
