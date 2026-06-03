export default class Level2 extends Phaser.Scene {
  constructor() {
    super("level2");
  }

  init(data) {
    this.pociones = data.pociones || 0; // recibe puntaje del nivel anterior
  }

  preload() {
    this.load.tilemapTiledJSON("mapa2", "public/assets/mapa2.json");
    this.load.image("atlas", "public/assets/ATLASPHASER2.png");
    this.load.spritesheet("sprites", "public/assets/ATLASPHASER2.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const map     = this.make.tilemap({ key: "mapa2" });
    const tileset = map.addTilesetImage("ATLAS", "atlas");

    map.createLayer("piso", tileset, 0, 0);
    const paredesCapa  = map.createLayer("paredes", tileset, 0, 0);
    const objetosLayer = map.getObjectLayer("objetos");

    paredesCapa.setCollision([2]);

    const spawn = map.findObject("objetos", (o) => o.name === "spawn");
    this.jugador = this.physics.add.sprite(spawn.x, spawn.y, "sprites", 40)
      .setDisplaySize(32, 32)
      .setCollideWorldBounds(true);
    this.jugador.body.allowGravity = false;
    this.jugador.body.setSize(20, 20);
    this.jugador.body.setOffset(6, 6);

    this.physics.add.collider(this.jugador, paredesCapa);

    this.cursores = this.input.keyboard.createCursorKeys();

    const fin = map.findObject("objetos", (o) => o.name === "fin");
    this.zonFin = this.add.zone(fin.x, fin.y, 32, 32);
    this.physics.world.enable(this.zonFin);
    this.zonFin.body.allowGravity = false;
    this.zonFin.body.immovable    = true;

    // Animaciones del gato
    this.anims.create({
      key: "caminar-abajo",
      frames: this.anims.generateFrameNumbers("sprites", { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "caminar-arriba",
      frames: this.anims.generateFrameNumbers("sprites", { start: 16, end: 19 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "caminar-derecha",
      frames: this.anims.generateFrameNumbers("sprites", { start: 24, end: 27 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "caminar-izquierda",
      frames: this.anims.generateFrameNumbers("sprites", { start: 32, end: 35 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("sprites", { start: 40, end: 43 }),
      frameRate: 4,
      repeat: -1
    });

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

    if (this.cursores.left.isDown) {
      this.jugador.setVelocityX(-160);
      this.jugador.anims.play("caminar-izquierda", true);
    } else if (this.cursores.right.isDown) {
      this.jugador.setVelocityX(160);
      this.jugador.anims.play("caminar-derecha", true);
    } else if (this.cursores.up.isDown) {
      this.jugador.setVelocityY(-160);
      this.jugador.anims.play("caminar-arriba", true);
    } else if (this.cursores.down.isDown) {
      this.jugador.setVelocityY(160);
      this.jugador.anims.play("caminar-abajo", true);
    } else {
      this.jugador.anims.play("idle", true); 
    }
  }

  recolectarPocion(jugador, pocion) {
    pocion.destroy();
    this.pociones++;
    this.textoUI.setText(this.getTexto());
  }

  llegarAlFin() {
    if (this.pociones >= 5) {
      this.scene.start("level3", { pociones: this.pociones });
    } else {
      console.log(`Te faltan ${5 - this.pociones} pociones`);
    }
  }

  getTexto() {
    return `Pociones: ${this.pociones}`;
  }
}