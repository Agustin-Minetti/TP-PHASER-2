export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.pociones = 0;
  }

  preload() {
    this.load.tilemapTiledJSON("mapa", "public/assets/mapa1.json");
    this.load.image("atlas", "public/assets/ATLASPHASER2.png");
    this.load.spritesheet("sprites", "public/assets/ATLASPHASER2.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // ── MAPA ──────────────────────────────────────────────
    const map     = this.make.tilemap({ key: "mapa" });
    const tileset = map.addTilesetImage("ATLAS", "atlas");

    map.createLayer("piso",    tileset, 0, 0);
    const paredesCapa  = map.createLayer("paredes", tileset, 0, 0);
    const objetosLayer = map.getObjectLayer("objetos");

    // ── COLISIONES DE PAREDES ─────────────────────────────
    paredesCapa.setCollision([2]);
    
    // ── JUGADOR ───────────────────────────────────────────
    const spawn = map.findObject("objetos", (o) => o.name === "spawn");
    this.jugador = this.physics.add.sprite(spawn.x, spawn.y, "sprites", 16)
      .setDisplaySize(32, 32)
      .setCollideWorldBounds(true);
    this.jugador.body.allowGravity = false;

    // ── COLISIÓN JUGADOR ↔ PAREDES ────────────────────────
    this.physics.add.collider(this.jugador, paredesCapa);

    // ── TECLADO ───────────────────────────────────────────
    this.cursores = this.input.keyboard.createCursorKeys();

    // ── ZONA DE FIN ───────────────────────────────────────
    const fin = map.findObject("objetos", (o) => o.name === "fin");
    this.zonFin = this.add.zone(fin.x, fin.y, 32, 32);
    this.physics.world.enable(this.zonFin);
    this.zonFin.body.allowGravity = false;
    this.zonFin.body.immovable    = true;

    // ── POCIONES ──────────────────────────────────────────
    this.grupoPociones = this.physics.add.staticGroup();
    objetosLayer.objects.forEach((obj) => {
      if (obj.name === "pocion" && obj.ellipse) {
        this.grupoPociones
          .create(obj.x, obj.y, "sprites", 44)
          .setDisplaySize(32, 32)
          .refreshBody();
      }
    });

    // ── OVERLAPS ──────────────────────────────────────────
    this.physics.add.overlap(
      this.jugador, this.grupoPociones,
      this.recolectarPocion, null, this
    );
    this.physics.add.overlap(
      this.jugador, this.zonFin,
      this.llegarAlFin, null, this
    );

    // ── UI ────────────────────────────────────────────────
    this.textoUI = this.add
      .text(16, 16, this.getTexto(), { fontSize: "20px", fill: "#ffffff" })
      .setScrollFactor(0);

    // ── CÁMARA ────────────────────────────────────────────
    this.cameras.main
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .startFollow(this.jugador);

    // ── SIN GRAVEDAD (top-down) ───────────────────────────
    this.physics.world.gravity.y = 0;
  }

  update() {
    this.jugador.setVelocity(0);

    if (this.cursores.left.isDown)       this.jugador.setVelocityX(-160);
    else if (this.cursores.right.isDown) this.jugador.setVelocityX(160);

    if (this.cursores.up.isDown)         this.jugador.setVelocityY(-160);
    else if (this.cursores.down.isDown)  this.jugador.setVelocityY(160);
  }

  recolectarPocion(jugador, pocion) {
    pocion.destroy();
    this.pociones++;
    this.textoUI.setText(this.getTexto());
  }

llegarAlFin() {
  if (this.pociones >= 5) {
    this.mostrarFin(true);
  } else {
    console.log(`Te faltan ${5 - this.pociones} pociones`);
  }
}

mostrarFin(gano) {
  // Pausar física y timers
  this.physics.pause();

  // Fondo oscuro
  this.add.rectangle(
    this.cameras.main.scrollX + 480,
    this.cameras.main.scrollY + 320,
    960, 640, 0x1a1a2e, 1
  );

  // Título
  const titulo = gano ? "¡GANASTE! 🎉" : "¡PERDISTE! 💀";
  const color  = gano ? "#ffdd00" : "#ff4444";
  this.add.text(
    this.cameras.main.scrollX + 480,
    this.cameras.main.scrollY + 220,
    titulo,
    { fontSize: "48px", fill: color }
  ).setOrigin(0.5);

  // Pociones recolectadas
  this.add.text(
    this.cameras.main.scrollX + 480,
    this.cameras.main.scrollY + 310,
    `Pociones recolectadas: ${this.pociones}/5`,
    { fontSize: "24px", fill: "#ffffff" }
  ).setOrigin(0.5);

  // Botón reiniciar
  this.add.text(
    this.cameras.main.scrollX + 480,
    this.cameras.main.scrollY + 420,
    "[ Jugar de nuevo ]",
    { fontSize: "24px", fill: "#aaffaa" }
  ).setOrigin(0.5)
    .setInteractive()
    .on("pointerdown", () => this.scene.restart());
}

  getTexto() {
    return `Pociones: ${this.pociones}/5`;
  }
}