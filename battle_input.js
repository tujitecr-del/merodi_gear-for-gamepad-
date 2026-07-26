// battle_input.js
window.touches = {
    up: false, left: false, right: false, down: false,
    en: false, barrier: false, near: false, far: false
};

const buttons = [
    { id: 'btn-up', key: 'up' },
    { id: 'btn-left', key: 'left' },
    { id: 'btn-right', key: 'right' },
    { id: 'btn-down', key: 'down' },
    { id: 'btn-en', key: 'en' },
    // あえてHTML側のIDを逆にして紐付ける場合：
    // もしHTMLのバリアボタンに 'btn-up' がついているなら、ここに合わせます
    { id: 'btn-barrier', key: 'barrier' },
    { id: 'btn-near', key: 'near' },
    { id: 'btn-far', key: 'far' }
];

buttons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (!el) return;

    // タッチ開始
    const press = (e) => {
        e.preventDefault(); // スマホのスクロール等の誤動作を完全に防ぐ
        window.touches[btn.key] = true;
    };
    
    // タッチ終了・キャンセル
    const release = (e) => {
        e.preventDefault();
        window.touches[btn.key] = false;
    };

    // --- タッチ操作用（スマホ・タブレット） ---
    // { passive: false } をつけることで preventDefault() が確実に効き、押しっぱなしが安定します
    el.addEventListener('touchstart', press, { passive: false });
    el.addEventListener('touchend', release, { passive: false });
    el.addEventListener('touchcancel', release, { passive: false });

    // --- マウス操作用（PC） ---
    el.addEventListener('mousedown', press);
    el.addEventListener('mouseup', release);
    // ボタンの外にマウスが出て離された時もオフにする
    el.addEventListener('mouseleave', release);
});

// ゲームパッドの入力を定期的に監視して window.touches に同期させる
function updateGamepadInput() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (gp) {
        // 左右移動（スティック ＋ 十字キー）
        window.touches.left = (gp.axes[0] < -0.2 || gp.buttons[14]?.pressed);
        window.touches.right = (gp.axes[0] > 0.2 || gp.buttons[15]?.pressed);
        
        // --- ジャンプ（上ボタン / 十字キー上 / △ボタン） ---
        window.touches.up = (
            gp.axes[1] < -0.5 ||            // アナログスティックの上
            //gp.buttons[12]?.pressed ||      // 十字キーの上 (12)
            gp.buttons[12]?.pressed          // △ボタン (3) ※余計な重複を削除しました
        );

        // --- 各アクションボタンを完全に独立させる ---
        window.touches.far = gp.buttons[0]?.pressed;     // A / × ボタン：遠距離武器
        window.touches.en = gp.buttons[3]?.pressed;      // B / ○ ボタン：ENチャージ
        window.touches.near = gp.buttons[1]?.pressed;    // X / □ ボタン：ビームソード
        window.touches.barrier = gp.buttons[2]?.pressed; // L1 / LB ボタン：バリア
    }

    requestAnimationFrame(updateGamepadInput);
}

window.addEventListener("gamepadconnected", (e) => {
    console.log("コントローラー接続完了: %s", e.gamepad.id);
    updateGamepadInput();
});