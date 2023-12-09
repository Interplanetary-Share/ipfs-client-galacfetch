import subprocess


def ejecutar_comando(comando):
    try:
        output = subprocess.check_output(
            comando, shell=True, stderr=subprocess.STDOUT)
        print(output.decode())
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar {comando}: {e.output.decode()}")


# Ejecutar los comandos necesarios
# Paso 1: Compilar con bit
ejecutar_comando('bit compile')

# Paso 2: Verificar el estado con bit
ejecutar_comando('bit status')

# Solicitar el mensaje del usuario para el tag
mensaje_tag = input("Introduce el mensaje para el tag: ")

# Preguntar al usuario si desea publicar todo (incluyendo los archivos no modificados)
publicar_todo = input(
    "¿Deseas publicar todos los archivos (incluyendo los no modificados)? (y/n): ").lower() == 'y'

# Paso 3: Crear un tag con bit usando el mensaje proporcionado
# y decidir si publicar todo o no
comando_tag = f'bit tag --skip-tests  --message "{mensaje_tag}"'
if publicar_todo:
    comando_tag += " --unmodified"
ejecutar_comando(comando_tag)

ejecutar_comando("bit login")
ejecutar_comando("bit export")

ejecutar_comando("git add .")
ejecutar_comando("git commit -m ':package: update .bitmap'")
