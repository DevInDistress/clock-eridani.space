import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class EridanianClockPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('Eridanian Clock'),
            icon_name: 'preferences-system-time-symbolic',
        });

        const group = new Adw.PreferencesGroup({
            title: _('Clock Position'),
        });

        const positionModel = new Gtk.StringList();
        positionModel.append(_('Left'));
        positionModel.append(_('Right'));

        const positionRow = new Adw.ComboRow({
            title: _('Placement in top bar'),
            model: positionModel,
        });

        const positionValues = ['left', 'right'];

        const syncPositionRow = () => {
            const currentPosition = settings.get_string('position');
            const index = positionValues.indexOf(currentPosition);
            positionRow.selected = index >= 0 ? index : 1;
        };

        positionRow.connect('notify::selected', () => {
            settings.set_string('position', positionValues[positionRow.selected] ?? 'right');
        });

        settings.connect('changed::position', syncPositionRow);
        syncPositionRow();

        group.add(positionRow);
        page.add(group);
        window.add(page);
    }
}