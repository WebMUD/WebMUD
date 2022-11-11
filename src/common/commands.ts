export function parse(data: string) {
    const parts = data.split(' ');
    const result = [];

    while (parts.length) {
        const next = read(parts);
        if (next) result.push(next);
    }

    return result;
}

function read(parts: string[]) {
    let next = parts.shift();

    if (next?.startsWith('"')) {
        let result = next.replace('"', '');

        if (next.endsWith('"')) return result.replace('"', '');
        
        while (next = parts.shift()) {
            if (next.endsWith('"')) {
                return result + ' ' + next.replace('"', '');
            }
            result += ' ' + next;
        }
    } else {
        return next;
    }
}