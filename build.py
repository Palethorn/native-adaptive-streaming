import argparse
import os
from glob import glob
from jinja2 import Environment, FileSystemLoader
import shutil
import yaml
import ntpath
import re

PATH = os.path.dirname(os.path.abspath(__file__))
DS = os.path.sep
parser = argparse.ArgumentParser()
parser.add_argument('-f', '--file', help="Process only a single file")
args = parser.parse_args()

yml = open(os.path.join(PATH, 'deployment', 'env.yml'), "r") 
env = yaml.load(yml.read())
yml.close()

dist_dir = os.path.join(PATH, "dist", env['environment'], env['target'])

yml = open(os.path.join(PATH, 'deployment', env['target'] + '.yml'), "r") 
config = yaml.load(yml.read())
yml.close()

config['path'] = PATH
config['dist_dir'] = dist_dir
j2_env = Environment(loader=FileSystemLoader(PATH), trim_blocks=True)

def build_file(env, config, f):
    if os.path.isfile(config['path'] + DS + f):
        f2 = f.replace('\\', '/')
        f3 = os.path.basename(f2)
        target_file = open(os.path.join(config['path'], 'dist', env['environment'], config['target'], f3), "w")
        output = j2_env.get_template(f2).render(config=config).encode("utf-8")

        if env['environment'] == 'release':
            output = re.sub('console.log\(.*\);', '', output)

        target_file.write(output)
        target_file.close()


def build_manifest(env, config):
    target_file = open(os.path.join(config['path'], 'dist', env['environment'], config['target'], 'manifest.json'), "w")
    target_file.write(j2_env.get_template('manifest.json').render(config=config).encode("utf-8"))
    target_file.close()


def build_all(env, config):
    result = [y for x in os.walk('src') for y in glob(os.path.join(x[0], '*'))]
    dst_libs_dir = os.path.join(config['path'], 'dist', env['environment'], config['target'], 'libs')
    dst_assets_dir = os.path.join(config['path'], 'dist', env['environment'], config['target'], 'assets')
    
    if os.path.isdir(dst_libs_dir):
        shutil.rmtree(dst_libs_dir)

    if os.path.isdir(dst_assets_dir):
        shutil.rmtree(dst_assets_dir)

    if os.path.isdir(os.path.join(config['path'], 'libs')):
            shutil.copytree(os.path.join(config['path'], 'libs'), dst_libs_dir)

    if os.path.isdir(os.path.join(config['path'], 'assets')):
        shutil.copytree(os.path.join(config['path'], 'assets'), dst_assets_dir)

    for f in result:
        build_file(env, config, f)

    dist_files = [y for x in os.walk(dist_dir) for y in glob(os.path.join(x[0], '*'))]
    web_accessible_resources = []

    for f in dist_files:
        if os.path.isfile(f):
            web_accessible_resources.append('"' + f.replace(dist_dir + DS, '').replace('\\', '/') + '"')
    
    config['web_accessible_resources'] =  ','.join(web_accessible_resources)
    build_manifest(env, config)

if not os.path.exists(dist_dir):
    os.makedirs(dist_dir)

if args.file == None:
    build_all(env, config)
else:
    f = args.file.replace(PATH + DS, '')
    build_file(env, config, f)