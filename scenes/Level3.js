export default class Level3 extends Phaser.Scene {
  constructor() {
    super("level3");
  }

  init(data) {
    this.pociones = data.pociones || 0;
  }

  preload() {
    this.load.tilemapTiledJSON("mapa3", "public/assets/mapa3.json");
    this.load.image("atlas", "public/assets/ATLASPHASER2.png");
    this.load.spritesheet("sprites", "public/assets/ATLASPHASER2.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const map     = this.make.tilemap({ key: "mapa3" });
    const tileset = map.addTilesetImage("ATLAS", "atlas");

    map.createLayer("piso", tileset, 0, 0);
    const paredesCapa  = map.createLayer("paredes", tileset, 0, 0);
    const objetosLayer = map.getObjectLayer("objetos");

    paredesCapa.setCollision([2, 4, 5, 6, 13, 14, 78]);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const spawn = map.findObject("objetos", (o) => o.name === "spawn");
    this.jugador = this.physics.add.sprite(spawn.x, spawn.y, "sprites", 16)
      .setDisplaySize(32, 32)
      .setCollideWorldBounds(true);
    this.jugador.body.allowGravity = false;

    this.physics.add.collider(this.jugador, paredesCapa);

    this.cursores = this.input.keyboard.createCursorKeys();

    const fin = map.findObject("objetos", (o) => o.name === "fin");
    this.zonFin = this.add.zone(fin.x, fin.y, 32, 32);
    this.physics.world.enable(this.zonFin);
    this.zonFin.body.allowGravity = false;
    this.zonFin.body.immovable    = true;

    this.grupoPociones = this.physics.add.staticGroup();
    objetosLayer.objects.forEach((obj) => {
      if (obj.name === "pocion" && obj.ellipse) {
        this.grupoPociones
          .create(obj.x, obj.y, "sprites", 44)
          .setDisplaySize(32, 32)
          .refreshBody();
      }
    });

    this.physics.add.overlap(
      this.jugador, this.grupoPociones,
      this.recolectarPocion, null, this
    );
    this.physics.add.overlap(
      this.jugador, this.zonFin,
      this.llegarAlFin, null, this
    );

    this.textoUI = this.add
      .text(16, 16, this.getTexto(), { fontSize: "20px", fill: "#ffffff" })
      .setScrollFactor(0);

    this.cameras.main
      .setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      .startFollow(this.jugador);

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
      this.mostrarVictoria();
    } else {
      console.log(`Te faltan ${5 - this.pociones} pociones`);
    }
  }

  mostrarVictoria() {
    this.physics.pause();
    this.add.rectangle(
      this.cameras.main.scrollX + 480,
      this.cameras.main.scrollY + 320,
      960, 640, 0x1a1a2e, 1
    );
    this.add.text(
      this.cameras.main.scrollX + 480,
      this.cameras.main.scrollY + 220,
      "¡GANASTE! 🎉",
      { fontSize: "48px", fill: "#ffdd00" }
    ).setOrigin(0.5);
    this.add.text(
      this.cameras.main.scrollX + 480,
      this.cameras.main.scrollY + 310,
      `Pociones totales: ${this.pociones}`,
      { fontSize: "24px", fill: "#ffffff" }
    ).setOrigin(0.5);
    this.add.text(
      this.cameras.main.scrollX + 480,
      this.cameras.main.scrollY + 420,
      "[ Jugar de nuevo ]",
      { fontSize: "24px", fill: "#aaffaa" }
    ).setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.scene.start("game"));
  }

  getTexto() {
    return `Pociones: ${this.pociones}`;
  }
}