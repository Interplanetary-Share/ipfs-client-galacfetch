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
ejecutar_comando('bit build')
ejecutar_comando('bit compile')
ejecutar_comando('bit status')
# ejecutar_comando('bit lint') //avoid linting for now
ejecutar_comando('bit test')

# Solicitar el mensaje del usuario para el tag
mensaje_tag = input("Introduce el mensaje para el tag: ")

publicar_todo = input(
    "¿Publicar todos los archivos (unmodified)? (y/n): ").lower() == 'y'

# Paso 3: Crear un tag con bit usando el mensaje proporcionado
# y decidir si publicar todo o no
comando_tag = f'bit tag --skip-tests  --message "{mensaje_tag}"'
if publicar_todo:
    comando_tag += " --unmodified --ignore-issues \"circular\" "
ejecutar_comando(comando_tag)

ejecutar_comando("bit login")
ejecutar_comando("bit export")
