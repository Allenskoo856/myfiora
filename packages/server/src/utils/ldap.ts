import ldap, {
    Client,
    SearchCallbackResponse,
    SearchEntry,
    SearchOptions,
} from 'ldapjs';

export type LdapConfig = {
    enable: boolean;
    url: string;
    bindDN: string;
    bindCredentials: string;
    searchBase: string;
    searchFilter: string;
    tlsOptions?: Record<string, unknown>;
};

export type LdapUser = {
    dn: string;
    attributes: Record<string, unknown>;
};

function formatSearchFilter(template: string, username: string) {
    return template.replace(/\{\{username\}\}/g, username);
}

function createClient(config: LdapConfig): Client {
    return ldap.createClient({
        url: config.url,
        tlsOptions: config.tlsOptions,
    });
}

function bind(client: Client, dn: string, password: string) {
    return new Promise<void>((resolve, reject) => {
        client.bind(dn, password, (err: Error | null | undefined) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function search(client: Client, base: string, options: SearchOptions) {
    return new Promise<SearchCallbackResponse>((resolve, reject) => {
        client.search(base, options, (err: Error | null, res: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(res as SearchCallbackResponse);
            }
        });
    });
}

function getFirstEntry(res: SearchCallbackResponse) {
    return new Promise<SearchEntry | null>((resolve, reject) => {
        let found: SearchEntry | null = null;
        res.on('searchEntry', (entry: SearchEntry) => {
            if (!found) {
                found = entry;
            }
        });
        res.on('error', reject);
        res.on('end', () => resolve(found));
    });
}

export async function authenticateWithLdap(
    config: LdapConfig,
    username: string,
    password: string,
): Promise<LdapUser | null> {
    if (!config.enable) {
        return null;
    }

    const client = createClient(config);
    try {
        await bind(client, config.bindDN, config.bindCredentials);

        const filter = formatSearchFilter(config.searchFilter, username);
        const res = await search(client, config.searchBase, {
            scope: 'sub',
            filter,
            sizeLimit: 1,
        });

        const entry = await getFirstEntry(res);
        if (!entry || !entry.dn) {
            return null;
        }

        await bind(client, entry.dn, password);
        return {
            dn: entry.dn,
            attributes: entry as unknown as Record<string, unknown>,
        };
    } finally {
        client.unbind();
    }
}
