# .pbsimply-hooks.rb
require "fileutils"
require "shellwords"
require "yaml"

class PBSimply            # ← module ではなく class
  class Hooks             # ← ここも class で再オープン
    def self.load_hooks(h)
      copy_dirs = %w[css javascript img]

      cfg = YAML.load_file(".pbsimply.yaml") rescue {}
      outdir = File.expand_path((cfg.is_a?(Hash) ? (cfg["outdir"] || "../Build") : "../Build"), Dir.pwd)
      srcdir = Dir.pwd

      # 動作確認ログ（任意）
      puts "[HOOK] static sync -> #{outdir}"

      h.post << lambda { |_processed|
        copy_dirs.each do |d|
          s = File.join(srcdir, d)
          next unless File.directory?(s)

          t = File.join(outdir, d)
          FileUtils.mkdir_p(t)

          if system("bash", "-lc", "command -v rsync >/dev/null 2>&1")
            system("bash", "-lc", "rsync -a --delete #{Shellwords.escape(s)}/ #{Shellwords.escape(t)}/")
          else
            Dir.children(t).each { |x| FileUtils.rm_rf(File.join(t, x)) }
            FileUtils.cp_r(Dir[File.join(s, "*")], t)
          end
          puts "[HOOK] synced #{d} -> #{t}"
        end
      }
    end
  end
end
